import { describe, it, expect } from 'vitest';
import { readFileSync, mkdtempSync, cpSync, rmSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { classify, generate, hash, validateContract } from '../scripts/capability-sync.mjs';
const root = resolve(import.meta.dirname, '..');
const baseline = JSON.parse(readFileSync(resolve(root, 'connectors/capabilities/source-contract.json')));
const clone = () => structuredClone(baseline);

describe('capability propagation candidates', () => {
  it('reruns deterministically across all nine cells and detects tracked artifact drift', () => {
    const first = generate(baseline);
    expect(first).toEqual(generate(baseline));
    expect(Object.keys(first)).toHaveLength(10);
    for (const [name, body] of Object.entries(first)) expect(body).toBe(readFileSync(resolve(root, 'connectors/capabilities/generated', name), 'utf8'));
  });
  it('propagates synthetic added and changed jobs to each product host without package edits', () => {
    const next = clone();
    for (const [product, row] of Object.entries(next.products)) {
      row.services.push({...row.services[0], service_id: `synthetic-${product}-addition-v1`});
      row.services[0].descriptor_sha256 = 'a'.repeat(64);
    }
    const output = generate(next);
    for (const [path, text] of Object.entries(output)) {
      if (path === 'manifest.json') continue;
      const cell = JSON.parse(text);
      expect(cell.services.some(s => s.service_id === `synthetic-${cell.product}-addition-v1`)).toBe(true);
      expect(cell.services[0].descriptor_sha256).toBe('a'.repeat(64));
      const original = JSON.parse(generate(baseline)[path]);
      expect(cell.package).toEqual(original.package);
      expect(cell.tool_metadata_sha256).toEqual(original.tool_metadata_sha256);
      expect(cell.published).toBe('not_observed');
    }
    expect(classify(baseline, next).changes.filter(c => c.kind === 'capability_added_readiness_review_required')).toHaveLength(3);
  });
  it('flags removals, renames, schema, readiness, provider and metadata changes independently', () => {
    for (const [edit, kind] of [
      [row => row.services.pop(), 'capability_removed_breaking'],
      [row => {row.services[0].service_id = 'renamed-v2'}, 'capability_removed_breaking'],
      [row => {row.services[0].request_schema_sha256 = 'b'.repeat(64)}, 'schema_or_version_compatibility_review_required'],
      [row => {row.services[0].execution_contract_sha256 = 'b'.repeat(64)}, 'execution_guidance_or_readiness_review_required'],
      [row => {row.services[0].provider.revision = 'b'.repeat(40)}, 'provider_revision_deployment_review_required'],
      [row => {row.tools[0].sha256 = 'b'.repeat(64)}, 'tool_metadata_review_required'],
    ]) {
      const next = clone(); edit(next.products.wave);
      expect(classify(baseline, next).changes.some(c => c.kind === kind)).toBe(true);
      expect(classify(baseline, next).automatic_publication).toBe(false);
    }
  });
  it('fails closed on missing products, duplicates, unknown tool surface and endpoint drift', () => {
    for (const edit of [
      next => {delete next.products.wave},
      next => next.products.wave.services.push(next.products.wave.services[0]),
      next => next.products.wave.tools.pop(),
      next => {next.products.wave.endpoint = next.products.quantum.endpoint},
    ]) { const next = clone(); edit(next); expect(() => validateContract(next)).toThrow(); }
  });
  it('preserves host auth and detects an incorrect Cursor client ID', () => {
    const temp = mkdtempSync(resolve(tmpdir(), 'rqm-sync-'));
    try {
      cpSync(resolve(root, 'connectors'), resolve(temp, 'connectors'), {recursive: true});
      const path = resolve(temp, 'connectors/plugins/waveengine/mcp.json');
      const config = JSON.parse(readFileSync(path));
      config.mcpServers.waveengine.auth.CLIENT_ID = 'wrong-product';
      writeFileSync(path, JSON.stringify(config));
      expect(() => generate(baseline, temp)).toThrow();
    } finally { rmSync(temp, {recursive: true, force: true}); }
  });
  it('generation cannot alter submitted-source package files or auth configuration', () => {
    const before = hash(generate(baseline));
    execFileSync(process.execPath, ['scripts/capability-sync.mjs', 'write'], {cwd: root});
    expect(hash(generate(baseline))).toBe(before);
  });
});
