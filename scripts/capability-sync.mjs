import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync, readdirSync, lstatSync, existsSync } from 'node:fs';
import { resolve, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { PRODUCTS, ROOT, packageFiles } from './chatgpt-publication.mjs';
import { NAMED_ACCOUNT_OPERATIONS } from './named-account-operations.mjs';

export const HOSTS = ['chatgpt', 'claude', 'cursor'];
const TOOL_NAMES = ['get_account_balance', 'get_account_job', 'list_account_jobs', 'list_buyer_jobs', 'run_account_job', 'search_buyer_jobs'];
export const encode = value => JSON.stringify(value, null, 2) + '\n';
export const hash = value => createHash('sha256').update(JSON.stringify(value, (_key, v) =>
  v !== null && typeof v === 'object' && !Array.isArray(v)
    ? Object.fromEntries(Object.entries(v).sort(([a], [b]) => a.localeCompare(b))) : v)).digest('hex');
const bytesHash = bytes => createHash('sha256').update(bytes).digest('hex');
const json = path => JSON.parse(readFileSync(path, 'utf8'));
const endpoint = product => `https://jobs.rqmtechnologies.com/mcp/plugins/${product}`;
const digest = value => assert.match(value, /^[a-f0-9]{64}$/);

function namedSurface(product, names) {
  const fixed = NAMED_ACCOUNT_OPERATIONS[product];
  assert(fixed, 'Named operations are unsupported for this product');
  const expected = [...TOOL_NAMES.filter(name => name !== 'run_account_job'),
    ...Object.values(fixed), ...(product === 'quantum'
      ? ['describe_quantum_capabilities', 'optimize_quantum_circuit', 'recommend_quantum_device'] : [])];
  // Preserve the pinned 28-tool producer snapshot and explicitly recognize the
  // observed 29-tool Quantum variant. Unknown additions still fail closed.
  if (product === 'quantum' && names.includes('recommend_quantum_routes'))
    expected.push('recommend_quantum_routes');
  assert.deepEqual([...names].sort(), expected.sort(), 'Named tool surface changed: manual host metadata review required');
  return fixed;
}

function validateToolSurface(product, tools) {
  const names = tools.map(tool => tool.name);
  assert.equal(new Set(names).size, names.length, 'Duplicate tool name');
  if (names.includes('run_account_job')) {
    assert.deepEqual([...names].sort(), TOOL_NAMES, 'Tool surface changed: manual host metadata review required');
    return null;
  }
  return namedSurface(product, names);
}

export function validateContract(contract) {
  assert.equal(contract.schema_version, 'rqm.connector-capabilities.v1');
  assert.deepEqual(Object.keys(contract.products).sort(), PRODUCTS.map(p => p.product).sort());
  for (const {product} of PRODUCTS) {
    const row = contract.products[product];
    assert.equal(row.endpoint, endpoint(product));
    const fixed = validateToolSurface(product, row.tools);
    row.tools.forEach(t => digest(t.sha256));
    assert(row.services.length > 0 && row.services.length <= 256);
    assert.equal(new Set(row.services.map(s => s.service_id)).size, row.services.length, 'Duplicate service ID');
    if (fixed) {
      assert.deepEqual(row.services.map(s => s.service_id).sort(), Object.keys(fixed).sort(), 'Named service membership changed');
      for (const service of row.services)
        assert.equal(service.execution_contract_sha256, hash({service_id: service.service_id, tool_name: fixed[service.service_id]}), 'Named execution mapping digest mismatch');
    }
    for (const service of row.services) {
      assert(typeof service.service_id === 'string' && service.service_id.length > 0);
      assert(typeof service.service_version === 'string' && service.service_version.length > 0);
      assert.equal(service.provider.repository, `RQM-Technologies-dev/${product === 'wave' ? 'wave-api' : product === 'quantum' ? 'rqm-api' : 'robotics-api'}`);
      assert.match(service.provider.revision, /^[a-f0-9]{40}$/);
      assert(typeof service.title === 'string' && service.title.length > 0);
      assert(['production_live', 'dark_candidate', 'advanced_only'].includes(service.readiness));
      for (const key of ['descriptor_sha256', 'request_schema_sha256', 'result_schema_sha256', 'execution_contract_sha256']) digest(service[key]);
    }
  }
  return contract;
}

export function summarizeProduct(product, tools, catalog) {
  assert(Array.isArray(catalog.descriptors));
  const fixed = validateToolSurface(product, tools);
  const named = Array.isArray(catalog.operation_tools);
  assert.equal(named, fixed !== null, 'Execution contract and tool surface disagree');
  assert(named ? catalog.account_execution_contracts === undefined : catalog.operation_tools === undefined,
    'Ambiguous execution contract');
  const contracts = named ? catalog.operation_tools : catalog.account_execution_contracts;
  assert(Array.isArray(contracts), 'Missing execution contracts');
  const executions = new Map(contracts.map(c => [named ? c.service_id : c.capability_id, c]));
  assert.equal(executions.size, catalog.descriptors.length, 'Missing or duplicate execution contracts');
  assert.equal(contracts.length, executions.size, 'Duplicate execution contracts');
  assert.equal(new Set(catalog.descriptors.map(d => d.service_id)).size, catalog.descriptors.length, 'Duplicate descriptor');
  assert.deepEqual([...executions.keys()].sort(), catalog.descriptors.map(d => d.service_id).sort(), 'Execution contract membership mismatch');
  if (fixed) assert.deepEqual([...executions.keys()].sort(), Object.keys(fixed).sort(), 'Named service membership changed');
  return {
    endpoint: endpoint(product),
    ...(catalog.interest_guidance ? {interest_guidance: catalog.interest_guidance} : {}),
    tools: tools.map(tool => ({name: tool.name, sha256: hash(tool)})).sort((a, b) => a.name.localeCompare(b.name, 'en')),
    services: catalog.descriptors.map(d => {
      assert.equal(d.product, product, 'Cross-product catalog leak');
      const execution = executions.get(d.service_id);
      if (named) {
        assert.deepEqual(execution, {service_id: d.service_id, tool_name: fixed[d.service_id]}, 'Invalid fixed named mapping');
        const tool = tools.find(t => t.name === execution.tool_name);
        const schema = tool.inputSchema;
        assert.equal(schema.type, 'object');
        assert.equal(schema.additionalProperties, false);
        assert.deepEqual([...schema.required].sort(), ['idempotency_key', 'max_total_price', 'request']);
        assert.deepEqual(Object.keys(schema.properties).sort(), ['idempotency_key', 'max_total_price', 'request']);
        for (const [field, pattern] of [['idempotency_key', '^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$'], ['max_total_price', '^(?:0|[1-9]\\d{0,5})(?:\\.\\d{1,6})?$']]) {
          assert.equal(schema.properties[field].type, 'string');
          assert.equal(schema.properties[field].pattern, pattern, 'Purchase guard schema drift');
        }
        const requestSchema = structuredClone(d.agent_discovery.request_schema);
        const defs = requestSchema.$defs;
        for (const key of ['$defs', '$id', '$schema']) delete requestSchema[key];
        assert.deepEqual(schema.properties.request, requestSchema, 'Named request schema drift');
        assert.deepEqual(schema.$defs, defs, 'Named request definitions drift');
        assert.equal(tool.annotations?.readOnlyHint, false);
        assert.equal(tool.annotations?.destructiveHint, true);
        assert.equal(tool.annotations?.idempotentHint, true);
        assert.deepEqual(tool._meta?.securitySchemes, [{type: 'oauth2', scopes: ['jobs.run']}]);
      } else {
        assert(execution && execution.tool === 'run_account_job', 'Execution must use buyer service_id');
        assert.deepEqual(execution.caller_supplied_fields, ['idempotency_key', 'max_total_price']);
        assert.equal(execution.principal_policy_readiness, 'unknown');
      }
      assert(d.agent_discovery.request_schema && d.agent_discovery.result_schema);
      return {
        service_id: d.service_id, service_version: d.service_version, title: d.title, readiness: d.readiness,
        provider: {repository: d.agent_discovery.evidence.identity, revision: d.agent_discovery.evidence.revision},
        descriptor_sha256: hash(d), request_schema_sha256: hash(d.agent_discovery.request_schema),
        result_schema_sha256: hash(d.agent_discovery.result_schema), execution_contract_sha256: hash(execution),
      };
    }).sort((a, b) => a.service_id.localeCompare(b.service_id, 'en')),
  };
}

// Public discovery only. Fixed origins; no token, signer, account or run calls.
export async function captureLive() {
  const products = {};
  for (const {product} of PRODUCTS) {
    const client = new Client({name: 'rqm-capability-drift', version: '1'});
    const transport = new StreamableHTTPClientTransport(new URL(endpoint(product)), {
      fetch: (url, init) => fetch(url, {...init, signal: AbortSignal.timeout(30_000)}),
    });
    try {
      await client.connect(transport);
      const listed = await client.listTools();
      assert(!listed.nextCursor, 'Paginated tool metadata must be handled before accepting snapshot');
      const response = await client.callTool({name: 'list_buyer_jobs', arguments: {}});
      assert(!response.isError, 'Catalog unavailable');
      const catalog = response.structuredContent ?? JSON.parse(response.content.find(c => c.type === 'text').text);
      products[product] = summarizeProduct(product, listed.tools, catalog);
    } finally { await client.close(); }
  }
  return validateContract({schema_version: 'rqm.connector-capabilities.v1', products});
}

export function classify(before, after) {
  validateContract(before); validateContract(after);
  const changes = [];
  for (const {product} of PRODUCTS) {
    const old = before.products[product], next = after.products[product];
    if (hash(old.interest_guidance ?? null) !== hash(next.interest_guidance ?? null)) changes.push({product, kind: 'descriptor_semantics_review_required'});
    if (hash(old.tools) !== hash(next.tools)) changes.push({product, kind: 'tool_metadata_review_required'});
    const previous = new Map(old.services.map(s => [s.service_id, s]));
    const current = new Map(next.services.map(s => [s.service_id, s]));
    for (const [id, service] of current) {
      const prior = previous.get(id);
      const kinds = [];
      if (!prior) kinds.push('capability_added_readiness_review_required');
      else {
        if (prior.request_schema_sha256 !== service.request_schema_sha256 || prior.result_schema_sha256 !== service.result_schema_sha256 || prior.service_version !== service.service_version) kinds.push('schema_or_version_compatibility_review_required');
        if (prior.execution_contract_sha256 !== service.execution_contract_sha256 || prior.readiness !== service.readiness) kinds.push('execution_guidance_or_readiness_review_required');
        if (hash(prior.provider) !== hash(service.provider)) kinds.push('provider_revision_deployment_review_required');
        if (prior.descriptor_sha256 !== service.descriptor_sha256 || prior.title !== service.title) kinds.push('descriptor_semantics_review_required');
      }
      for (const kind of kinds) changes.push({product, service_id: id, kind});
    }
    for (const id of previous.keys()) if (!current.has(id)) changes.push({product, service_id: id, kind: 'capability_removed_breaking'});
  }
  return {schema_version: 'rqm.connector-change-report.v1', changed: changes.length > 0, changes,
    host_acceptance: 'not_observed', automatic_publication: false};
}

function packageEvidence(root, item, host) {
  const base = resolve(root, host === 'chatgpt' ? 'connectors/chatgpt' : 'connectors/plugins', item.name);
  const manifestPath = host === 'chatgpt' ? 'plugin.json' : `.${host}-plugin/plugin.json`;
  const manifest = json(resolve(base, manifestPath));
  const configPath = host === 'chatgpt' ? 'mcp.json' : manifest.mcpServers;
  const files = {};
  const visit = path => {
    const absolute = resolve(base, path);
    assert(!relative(base, absolute).startsWith('..'), 'Package path escapes');
    const stat = lstatSync(absolute);
    assert(!stat.isSymbolicLink(), 'Package symlink not allowed');
    if (stat.isDirectory()) for (const child of readdirSync(absolute).sort()) visit(`${path}/${child}`);
    else files[path.replace(/^\.\//, '')] = bytesHash(readFileSync(absolute));
  };
  const packagePaths = host === 'chatgpt' ? packageFiles(item) : [manifestPath, configPath, manifest.skills ?? './skills/', ...['README.md', 'PRIVACY.md', 'LICENSE', 'NOTICE', 'listing.json', 'assets/'].filter(path => existsSync(resolve(base, path)))];
  for (const path of new Set(packagePaths)) visit(path);
  const config = json(resolve(base, configPath)).mcpServers;
  assert.deepEqual(Object.keys(config), [item.name]);
  assert.equal(config[item.name].url, endpoint(item.product), 'Host endpoint drift');
  if (host === 'cursor') {
    assert.equal(config[item.name].auth.CLIENT_ID, `rqm-cursor-${item.product}`);
    assert.deepEqual(config[item.name].auth.scopes, ['jobs.read', 'jobs.run', 'balance.read']);
    assert(!config[item.name].auth.CLIENT_SECRET);
  } else {
    assert.deepEqual(config[item.name], {type: host === 'chatgpt' ? 'streamable-http' : 'http', url: endpoint(item.product)});
  }
  return {source_path: relative(root, base), version: manifest.version, package_content_sha256: hash(files), files};
}

export function generate(contract, root = ROOT) {
  validateContract(contract);
  const artifacts = {};
  for (const item of PRODUCTS) for (const host of HOSTS) {
    const source = contract.products[item.product];
    const fixed = validateToolSurface(item.product, source.tools);
    artifacts[`${host}/${item.name}.json`] = encode({
      schema_version: 'rqm.host-capability-coverage.v1', host, product: item.product,
      endpoint: source.endpoint, discovery_tool: 'list_buyer_jobs', search_tool: 'search_buyer_jobs',
      execution_tool: fixed ? 'fixed_named_operation' : 'run_account_job',
      capability_id_source: fixed ? 'fixed_named_tool_mapping' : 'descriptor.service_id',
      catalog_sha256: hash(source.services), tool_metadata_sha256: hash(source.tools),
      services: source.services.map(s => ({service_id: s.service_id, descriptor_sha256: s.descriptor_sha256,
        ...(fixed ? {execution_tool: fixed[s.service_id]} : {})})),
      package: packageEvidence(root, item, host),
      deployed: 'not_observed', host_discovered: 'not_observed', published: 'not_observed',
    });
  }
  artifacts['manifest.json'] = encode({schema_version: 'rqm.connector-generation.v1', source_contract_sha256: hash(contract),
    generator_sha256: bytesHash(readFileSync(fileURLToPath(import.meta.url))),
    named_operation_mappings_sha256: bytesHash(readFileSync(new URL('./named-account-operations.mjs', import.meta.url))),
    artifacts: Object.fromEntries(Object.entries(artifacts).map(([name, text]) => [name, bytesHash(text)])),
    automatic_publication: false});
  return artifacts;
}

async function main(args) {
  const mode = args.shift() ?? 'check';
  assert(['check', 'write', 'compare', 'live'].includes(mode), 'Use check, write, compare, or live');
  const source = resolve(ROOT, 'connectors/capabilities/source-contract.json');
  if (mode !== 'compare') {
    const provenance = json(resolve(ROOT, 'connectors/capabilities/SOURCE.json'));
    assert.equal(provenance.repository, 'RQM-Technologies-dev/RQM-Jobs-MCP');
    assert.match(provenance.revision, /^[a-f0-9]{40}$/);
    assert.equal(provenance.contract_sha256, bytesHash(readFileSync(source)), 'Imported contract does not match source provenance');
  }
  if (mode === 'live') {
    const out = resolve(args[0] ?? 'dist/capability-sync'); mkdirSync(out, {recursive: true});
    let observed;
    try { observed = await captureLive(); } catch (error) {
      writeFileSync(resolve(out, 'report.json'), encode({schema_version: 'rqm.connector-change-report.v1', status: 'unavailable_or_invalid_contract', error: error.message, observed_at: new Date().toISOString(), host_acceptance: 'not_observed', automatic_publication: false}));
      throw error;
    }
    writeFileSync(resolve(out, 'observed-contract.json'), encode(observed));
    const report = classify(json(source), observed);
    writeFileSync(resolve(out, 'report.json'), encode({...report, observed_at: new Date().toISOString()}));
    for (const [name, text] of Object.entries(generate(observed))) {
      const path = resolve(out, 'candidate', name); mkdirSync(dirname(path), {recursive: true}); writeFileSync(path, text);
    }
    console.log(encode(report)); if (report.changed) process.exitCode = 2;
    return;
  }
  if (mode === 'compare') { console.log(encode(classify(json(args[0]), json(args[1])))); return; }
  const artifacts = generate(json(source));
  const out = resolve(ROOT, 'connectors/capabilities/generated');
  const drift = [];
  for (const [name, text] of Object.entries(artifacts)) {
    const path = resolve(out, name);
    if (mode === 'write') { mkdirSync(dirname(path), {recursive: true}); writeFileSync(path, text); }
    else { try { if (readFileSync(path, 'utf8') !== text) drift.push(name); } catch { drift.push(name); } }
  }
  if (mode === 'check' && existsSync(out)) {
    const scan = directory => {
      for (const entry of readdirSync(directory, {withFileTypes: true})) {
        const path = resolve(directory, entry.name);
        if (entry.isDirectory()) scan(path);
        else if (!(relative(out, path) in artifacts)) drift.push(relative(out, path));
      }
    };
    scan(out);
  }
  console.log(encode({mode, artifacts: Object.keys(artifacts).length, drift, classification: drift.length ? 'generated_artifact_or_package_review_required' : 'unchanged', automatic_publication: false}));
  if (drift.length) process.exitCode = 1;
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main(process.argv.slice(2));
