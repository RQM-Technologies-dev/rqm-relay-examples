import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { summarizeProduct, validateContract, generate, hash, classify } from '../scripts/capability-sync.mjs';
import { NAMED_ACCOUNT_OPERATIONS } from '../scripts/named-account-operations.mjs';

const baseline = JSON.parse(readFileSync(new URL('../connectors/capabilities/source-contract.json', import.meta.url)));
const common = ['get_account_balance', 'get_account_job', 'list_account_jobs', 'list_buyer_jobs', 'search_buyer_jobs'];
function fixture(product) {
  const fixed = NAMED_ACCOUNT_OPERATIONS[product];
  const descriptors = Object.keys(fixed).map(service_id => ({
    product, service_id, service_version: '1.0.0', title: service_id, readiness: 'production_live',
    agent_discovery: {
      request_schema: {type: 'object', properties: {value: {$ref: '#/$defs/Value'}}, $defs: {Value: {type: 'number'}}, required: ['value'], additionalProperties: false},
      result_schema: {type: 'object'},
      evidence: {identity: `RQM-Technologies-dev/${product === 'wave' ? 'wave-api' : 'rqm-api'}`, revision: 'a'.repeat(40)},
    },
  }));
  const tools = [...common, ...(product === 'quantum' ? ['describe_quantum_capabilities', 'optimize_quantum_circuit', 'recommend_quantum_device'] : [])].map(name => ({name}));
  for (const descriptor of descriptors) {
    const request = structuredClone(descriptor.agent_discovery.request_schema);
    const $defs = request.$defs; delete request.$defs;
    tools.push({name: fixed[descriptor.service_id],
      inputSchema: {type: 'object', additionalProperties: false, required: ['request', 'idempotency_key', 'max_total_price'],
        properties: {request, idempotency_key: {type: 'string', pattern: '^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$'},
          max_total_price: {type: 'string', pattern: '^(?:0|[1-9]\\d{0,5})(?:\\.\\d{1,6})?$'}}, $defs},
      annotations: {readOnlyHint: false, destructiveHint: true, idempotentHint: true},
      _meta: {securitySchemes: [{type: 'oauth2', scopes: ['jobs.run']}]},
    });
  }
  return {tools, catalog: {descriptors, operation_tools: descriptors.map(d => ({service_id: d.service_id, tool_name: fixed[d.service_id]}))}};
}

describe('fixed named account-operation compatibility', () => {
  it('retains producer interest guidance and detects guidance-only drift', () => {
    const {tools, catalog} = fixture('quantum');
    catalog.interest_guidance = {instruction: 'Inspect supplied inputs before selecting a service.'};
    expect(summarizeProduct('quantum', tools, catalog).interest_guidance).toEqual(catalog.interest_guidance);
    const changed = structuredClone(baseline);
    changed.products.quantum.interest_guidance = {instruction: 'Changed guidance requires review.'};
    expect(classify(baseline, changed).changes).toContainEqual({product: 'quantum', kind: 'descriptor_semantics_review_required'});
  });
  it.each(['wave', 'quantum'])('validates every fixed %s mapping and preserves exact execution hashes', product => {
    const {tools, catalog} = fixture(product);
    const row = summarizeProduct(product, tools, catalog);
    expect(row.services).toHaveLength(20);
    for (const service of row.services)
      expect(service.execution_contract_sha256).toBe(hash(catalog.operation_tools.find(c => c.service_id === service.service_id)));
    const contract = structuredClone(baseline); contract.products[product] = row;
    expect(validateContract(contract)).toBe(contract);
    const artifacts = generate(contract);
    const branded = product === 'wave' ? 'waveengine' : 'resonant-quantum-mechanics';
    for (const host of ['chatgpt', 'claude', 'cursor']) {
      const cell = JSON.parse(artifacts[`${host}/${branded}.json`]);
      expect(cell.execution_tool).toBe('fixed_named_operation');
      expect(cell.services.map(s => [s.service_id, s.execution_tool])).toEqual(row.services.map(s => [s.service_id, NAMED_ACCOUNT_OPERATIONS[product][s.service_id]]));
      expect(cell.host_discovered).toBe('not_observed');
    }
  });

  it.each(['wave', 'quantum'])('rejects malformed or broadened %s mappings and purchase guards', product => {
    for (const edit of [
      f => f.catalog.operation_tools.pop(),
      f => f.catalog.operation_tools.push(f.catalog.operation_tools[0]),
      f => {f.catalog.operation_tools[0].tool_name = f.catalog.operation_tools[1].tool_name},
      f => {f.catalog.operation_tools[0].service_id = 'unknown-service'},
      f => {f.catalog.operation_tools[0].tool_name = 'robotics_unknown_v1'},
      f => {f.catalog.operation_tools[0].principal_policy_readiness = 'ready'},
      f => {f.catalog.account_execution_contracts = []},
      f => f.catalog.descriptors.push(f.catalog.descriptors[0]),
      f => f.tools.pop(),
      f => f.tools.push(f.tools[0]),
      f => f.tools.push({name: 'unknown_paid_tool'}),
      f => f.tools.push({name: 'run_account_job'}),
      f => {f.tools.at(-1).inputSchema.properties.capability_id = {type: 'string'}},
      f => {f.tools.at(-1).inputSchema.properties.max_total_price.pattern = '.*'},
      f => {f.tools.at(-1).inputSchema.properties.request.required = []},
      f => {f.tools.at(-1).inputSchema.$defs.Value.type = 'string'},
      f => {f.tools.at(-1)._meta.securitySchemes = [{type: 'noauth'}]},
      f => {f.tools.at(-1).annotations.readOnlyHint = true},
    ]) {
      const f = fixture(product); edit(f);
      expect(() => summarizeProduct(product, f.tools, f.catalog)).toThrow();
    }
    const f = fixture(product); const contract = structuredClone(baseline);
    contract.products[product] = summarizeProduct(product, f.tools, f.catalog);
    contract.products[product].services[0].execution_contract_sha256 = 'b'.repeat(64);
    expect(() => validateContract(contract)).toThrow('mapping digest');
  });

  it('continues to accept the legacy contract while rejecting duplicates and mixed variants', () => {
    const tools = [...common, 'run_account_job'].map(name => ({name}));
    const {descriptors} = fixture('wave').catalog;
    const catalog = {descriptors, account_execution_contracts: descriptors.map(d => ({capability_id: d.service_id, tool: 'run_account_job', caller_supplied_fields: ['idempotency_key', 'max_total_price'], principal_policy_readiness: 'unknown'}))};
    expect(summarizeProduct('wave', tools, catalog).services).toHaveLength(20);
    catalog.account_execution_contracts.push(catalog.account_execution_contracts[0]);
    expect(() => summarizeProduct('wave', tools, catalog)).toThrow('Duplicate execution');
  });
});
