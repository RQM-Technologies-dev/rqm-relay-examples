import assert from 'node:assert/strict';
import {readFileSync,lstatSync,realpathSync,mkdirSync,writeFileSync} from 'node:fs';
import {resolve,relative,dirname} from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import Ajv2020 from 'ajv/dist/2020.js';
export const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'..');
export const PRODUCTS=[
 {name:'resonant-quantum-mechanics',product:'quantum',asset:'quantum-59c0e77394f41197.png',hash:'59c0e77394f411979214606d8c19af7e90a2735d84154e9390aab8c3e9f9e354'},
 {name:'waveengine',product:'wave',asset:'wave-dab197da82677d4.png',hash:'dab197da82677d489445c1322c0583f837fed5e54ae288bb1c953d749e722633'},
 {name:'robotics-lab',product:'robotics',asset:'robotics-54c5a66443a9c9ed.png',hash:'54c5a66443a9c9ed1a21b810c2549d2e41270a9cc46f0275620d4b4f2f19f4bd'}
];
const json=path=>JSON.parse(readFileSync(path,'utf8'));
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
export function packageFiles(item){return ['plugin.json','mcp.json','README.md','PRIVACY.md','LICENSE','NOTICE','assets/PROVENANCE.md',`assets/${item.asset}`,`skills/${item.name}/SKILL.md`];}
export function containedFile(base,path){
 assert(path.startsWith('./'),'Asset paths require ./');
 const target=resolve(base,path);assert(!relative(base,target).startsWith('..'),'Path escapes package');
 assert(!lstatSync(target).isSymbolicLink(),'Symlink not allowed');
 assert(!relative(realpathSync(base),realpathSync(target)).startsWith('..'),'Resolved path escapes package');
 assert(lstatSync(target).isFile(),'File required');return target;
}
function text(value,max,label){assert(typeof value==='string'&&value.trim().length>0&&[...value].length<=max,`Invalid ${label}`);assert(!/[\u0000-\u001f\u007f]/u.test(value),`Control characters in ${label}`);}
function https(value){const url=new URL(value);assert(url.protocol==='https:'&&!url.username&&!url.password,'Public HTTPS URL required');}
export function validatePackages(root=ROOT){
 const schemaBase=resolve(root,'connectors/chatgpt/schemas');const ajv=new Ajv2020({allErrors:true});
 const pluginCheck=ajv.compile(json(resolve(schemaBase,'plugin.schema.json')));const mcpCheck=ajv.compile(json(resolve(schemaBase,'mcp.schema.json')));
 return PRODUCTS.map(item=>{
  const base=resolve(root,'connectors/chatgpt',item.name);const manifest=json(resolve(base,'plugin.json'));const mcp=json(resolve(base,'mcp.json'));
  assert(pluginCheck(manifest),JSON.stringify(pluginCheck.errors));assert(mcpCheck(mcp),JSON.stringify(mcpCheck.errors));
  assert.equal(manifest.name,item.name);assert.match(manifest.version,/^\d+\.\d+\.\d+$/);assert.equal(manifest.author.name,'RQM Technologies LLC');
  assert.deepEqual(mcp.mcpServers,{[item.name]:{type:'streamable-http',url:`https://jobs.rqmtechnologies.com/mcp/plugins/${item.product}`}});
  const openai=manifest.extensions?.['com.openai'];assert(openai&&!openai.apps&&!openai.hooks,'Submission cannot contain app references or hooks');
  const ui=openai.interface;
  for(const [key,max] of Object.entries({displayName:30,shortDescription:30,longDescription:4000,developerName:80,category:120}))text(ui[key],max,key);
  for(const key of ['websiteURL','supportURL','privacyPolicyURL','termsOfServiceURL']){text(ui[key],1024,key);https(ui[key]);}
  if(ui.termsOfServiceURL)https(ui.termsOfServiceURL);
  assert(['Developer Tools','Productivity'].includes(ui.category),'Verify category in portal before submission');
  assert(Array.isArray(ui.defaultPrompt)&&ui.defaultPrompt.length<=3);for(const prompt of ui.defaultPrompt)text(prompt,128,'defaultPrompt');
  for(const key of ['logo','composerIcon']){
   const file=containedFile(base,ui[key]);assert.equal(ui[key],`./assets/${item.asset}`);
   const bytes=readFileSync(file);assert.equal(digest(bytes),item.hash,'Approved artwork changed');assert(bytes.length<=5*1024*1024);assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
   const width=bytes.readUInt32BE(16),height=bytes.readUInt32BE(20);assert(width===height&&width>=48&&width<=4096,'Invalid icon dimensions');
  }
  assert(!('commerce' in openai.review),'No unreviewed commerce declaration');assert(!('countries' in openai.publication),'No invented distribution countries');
  assert(!openai.review.test_credentials&&!openai.review.reviewer_instructions,'Reviewer credentials stay outside ZIP');
  const cases=openai.review.test_cases;assert.equal(cases.positive.length,5);assert.equal(cases.negative.length,3);
  for(const entry of [...cases.positive,...cases.negative]){text(entry.description,4000,'case description');text(entry.prompt,4000,'case prompt');assert(entry.expected_behavior);}
  for(const entry of cases.positive){assert(entry.tools_triggered);assert(!entry.tools_triggered.includes('run_account_job'),'Draft validation must not request paid acceptance');}
  const files=packageFiles(item);for(const file of files)containedFile(base,'./'+file);
  return {name:item.name,version:manifest.version,files,logo_sha256:item.hash,packageValid:true,submissionReady:false,blockers:['OpenAI policy acceptance is not established by this package','Existing v0.1.0 review records require supported OAuth endpoint migration and tool scans','Current reviewer material and tool execution evidence is unverified in this offline package check','Final category, distribution and truthful portal attestations require verification']};
 });
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const report=validatePackages();const pack=process.argv.indexOf('--pack');
 if(pack>=0){const output=resolve(process.argv[pack+1]??'dist/chatgpt-publication');mkdirSync(output,{recursive:true});
  execFileSync('python3',[resolve(ROOT,'scripts/pack-chatgpt-publication.py'),output],{cwd:ROOT,stdio:'inherit'});
  writeFileSync(resolve(output,'readiness.json'),JSON.stringify(report,null,2)+'\n');
 }
 console.log(JSON.stringify(report,null,2));if(process.argv.includes('--require-submission-ready')&&report.some(x=>!x.submissionReady))process.exitCode=1;
}
