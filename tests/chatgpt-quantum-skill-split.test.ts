/** Offline package/acceptance-fixture checks. These do not execute an LLM or host toggle UI. */
import {describe,it,expect} from 'vitest';
import {readFileSync,readdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {execFileSync} from 'node:child_process';
const root=resolve(import.meta.dirname,'..');
const base=resolve(root,'connectors/chatgpt/resonant-quantum-mechanics');
const read=(path:string)=>readFileSync(resolve(base,path),'utf8');
const manifest=JSON.parse(read('plugin.json'));
const FREE=new Set(['learn_quantum_circuit','explain_quantum_circuit','find_learning_resources']);
const HARDWARE=new Set(['describe_hardware_execution','list_quantum_hardware','plan_quantum_experiment','quote_hardware_execution','submit_hardware_execution','get_settled_hardware_result']);
const prompts=[
 {skill:'resonant-quantum-mechanics',prompt:'Explain a Bell circuit and its ideal probabilities for free; use text if the viewer fails.',trace:['explain_quantum_circuit']},
 {skill:'run-quantum-hardware',prompt:'Plan my supplied circuit on supported real hardware; review a quote before I approve any spend.',trace:['describe_hardware_execution','list_quantum_hardware','plan_quantum_experiment']},
];
function validateFixtureTrace(skill:string,trace:string[]){
 const allowed=skill==='resonant-quantum-mechanics'?FREE:HARDWARE;
 for(const tool of trace)if(!allowed.has(tool))throw new Error('acceptance fixture crosses skill scope');
}
describe('two-skill public Quantum package candidate',()=>{
 it('retains one plugin identity/endpoint with exactly two unique discoverable skills',()=>{
  expect(manifest.name).toBe('resonant-quantum-mechanics');
  expect(readdirSync(resolve(base,'skills')).sort()).toEqual(['resonant-quantum-mechanics','run-quantum-hardware']);
  for(const {skill} of prompts){expect(read(`skills/${skill}/SKILL.md`)).toMatch(new RegExp(`^---\\nname: ${skill}\\n`));}
  expect(JSON.parse(read('mcp.json')).mcpServers).toEqual({'resonant-quantum-mechanics':{type:'streamable-http',url:'https://jobs.rqmtechnologies.com/mcp/plugins/quantum'}});
  expect(manifest.extensions['com.openai'].apps).toBeUndefined();
  expect(manifest.extensions['com.openai'].onboardingSkill).toBe('./skills/resonant-quantum-mechanics/SKILL.md');
 });
 it('includes both skill bodies and UI metadata in the actual ZIP allowlist',()=>{
  const reports=JSON.parse(execFileSync(process.execPath,['scripts/chatgpt-publication.mjs'],{cwd:root,encoding:'utf8'}));
  const files:string[]=reports.find((item:{name:string})=>item.name===manifest.name).files;
  expect(files.filter((path:string)=>path.endsWith('/SKILL.md'))).toHaveLength(2);
  for(const {skill} of prompts){
   expect(files).toContain(`skills/${skill}/SKILL.md`);
   expect(files).toContain(`skills/${skill}/agents/openai.yaml`);
  }
 });
 it.each(prompts)('has a separate explicit-selection acceptance prompt for $skill',({skill,prompt,trace})=>{
  expect(prompt.length).toBeGreaterThan(30);
  validateFixtureTrace(skill,trace);
  expect(read(`skills/${skill}/agents/openai.yaml`)).toContain(`$${skill}`);
 });
 it('rejects cross-routing in the offline acceptance traces',()=>{
  for(const tool of HARDWARE)expect(()=>validateFixtureTrace('resonant-quantum-mechanics',[tool])).toThrow();
  for(const tool of FREE)expect(()=>validateFixtureTrace('run-quantum-hardware',[tool])).toThrow();
 });
 it('keeps free review cases free and uses only strict read-only return-visit recovery',()=>{
  const cases=manifest.extensions['com.openai'].review.test_cases.positive;
  for(const row of cases.slice(0,2))validateFixtureTrace('resonant-quantum-mechanics',row.tools_triggered.split(', '));
  for(const row of cases.slice(2))validateFixtureTrace('run-quantum-hardware',row.tools_triggered.split(', '));
  expect(cases[3].tools_triggered).toBe('get_settled_hardware_result');
 });
 it('dry-runs a paid acceptance fixture only against an in-memory mock with exact consent and retry binding',()=>{
  const quote={quote_id:'synthetic-quote',digest:'synthetic-bound-digest',amount:'0.400000',currency:'USD'};
  const executions=new Map<string,string>();let submissions=0;
  const mockSubmit=(approved:typeof quote|null,key:string)=>{
   if(JSON.stringify(approved)!==JSON.stringify(quote))throw new Error('exact quote consent required');
   if(executions.has(key))return executions.get(key);
   if(executions.size)throw new Error('recover original execution; no replacement');
   submissions++;executions.set(key,'synthetic-execution');return 'synthetic-execution';
  };
  expect(()=>mockSubmit(null,'original')).toThrow();
  expect(()=>mockSubmit({...quote,amount:'0.500000'},'original')).toThrow();
  expect(mockSubmit(quote,'original')).toBe('synthetic-execution');
  expect(mockSubmit(quote,'original')).toBe('synthetic-execution');
  expect(()=>mockSubmit(quote,'replacement')).toThrow();
  expect(submissions).toBe(1);
 });
});
