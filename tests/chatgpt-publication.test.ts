import { describe, it, expect } from "vitest";
import { execFileSync } from "node:child_process";
import { mkdtempSync, cpSync, readFileSync, writeFileSync, rmSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
const root=resolve(import.meta.dirname,"..");
const script="scripts/chatgpt-publication.mjs";
const fixture=()=>{const path=mkdtempSync(resolve(tmpdir(),"rqm-publication-test-"));cpSync(resolve(root,"connectors/chatgpt"),resolve(path,"connectors/chatgpt"),{recursive:true});return path;};
const validate=(path:string)=>execFileSync(process.execPath,["--input-type=module","-e",`import('./${script}').then(m=>m.validatePackages(process.argv[1]))`,path],{cwd:root,stdio:"pipe"});
const manifest=(base:string)=>resolve(base,"connectors/chatgpt/robotics-lab/plugin.json");
describe("public publication preparation",()=>{
 it("validates three drafts without claiming submission readiness",()=>{
  const reports=JSON.parse(execFileSync(process.execPath,[script],{cwd:root,encoding:"utf8"}));
  expect(reports).toHaveLength(3);expect(reports.every((x:{packageValid:boolean;submissionReady:boolean})=>x.packageValid&&!x.submissionReady)).toBe(true);
  expect(()=>execFileSync(process.execPath,[script,"--require-submission-ready"],{cwd:root,stdio:"pipe"})).toThrow();
 });
 it("rejects out-of-package icon references",()=>{
  const path=fixture();try{const p=manifest(path),m=JSON.parse(readFileSync(p,"utf8"));m.extensions["com.openai"].interface.logo="./../../PUBLICATION.md";writeFileSync(p,JSON.stringify(m));expect(()=>validate(path)).toThrow();}finally{rmSync(path,{recursive:true,force:true});}
 });
 it("rejects altered original artwork",()=>{
  const path=fixture();try{const p=resolve(path,"connectors/chatgpt/robotics-lab/assets/robotics-54c5a66443a9c9ed.png");const bytes=readFileSync(p);bytes[bytes.length-1]^=1;writeFileSync(p,bytes);expect(()=>validate(path)).toThrow();}finally{rmSync(path,{recursive:true,force:true});}
 });
 it("rejects symlinked artwork and credential-bearing MCP configuration",()=>{
  const path=fixture();try{
   const p=resolve(path,"connectors/chatgpt/robotics-lab/assets/robotics-54c5a66443a9c9ed.png");rmSync(p);symlinkSync(resolve(root,"connectors/chatgpt/robotics-lab/assets/robotics-54c5a66443a9c9ed.png"),p);expect(()=>validate(path)).toThrow();
  }finally{rmSync(path,{recursive:true,force:true});}
  const next=fixture();try{const p=resolve(next,"connectors/chatgpt/robotics-lab/mcp.json"),m=JSON.parse(readFileSync(p,"utf8"));m.mcpServers["robotics-lab"].headers={Authorization:"Bearer fixture-not-a-credential"};writeFileSync(p,JSON.stringify(m));expect(()=>validate(next)).toThrow();}finally{rmSync(next,{recursive:true,force:true});}
 });
 it("produces deterministic root ZIPs with exactly approved files",()=>{
  const first=mkdtempSync(resolve(tmpdir(),"rqm-publication-zip-")),second=mkdtempSync(resolve(tmpdir(),"rqm-publication-zip-"));
  try{
   for(const output of [first,second])execFileSync(process.execPath,[script,"--pack",output],{cwd:root,stdio:"pipe"});
   for(const name of ["resonant-quantum-mechanics","waveengine","robotics-lab"]){const version=JSON.parse(readFileSync(resolve(root,"connectors/chatgpt",name,"plugin.json"),"utf8")).version;const file=name+"-"+version+"-draft.zip";expect(readFileSync(resolve(first,file))).toEqual(readFileSync(resolve(second,file)));}
   execFileSync("python3",["-c",`import zipfile,pathlib,sys\nfor path in pathlib.Path(sys.argv[1]).glob('*.zip'):\n with zipfile.ZipFile(path) as z:\n  names=z.namelist(); assert len(names)==9; assert 'plugin.json' in names and 'mcp.json' in names; assert not any(n.startswith('/') or '..' in n.split('/') or n.endswith('.app.json') or '.env' in n for n in names); assert z.testzip() is None`,first],{stdio:"pipe"});
  }finally{rmSync(first,{recursive:true,force:true});rmSync(second,{recursive:true,force:true});}
 }, 60_000);
 it("preserves existing portal record names and changes no other ZIP content",()=>{
  const first=mkdtempSync(resolve(tmpdir(),"rqm-portal-zip-")),second=mkdtempSync(resolve(tmpdir(),"rqm-portal-zip-"));
  try{
   for(const output of [first,second])execFileSync(process.execPath,[script,"--pack",output,"--portal-records"],{cwd:root,stdio:"pipe"});
   execFileSync("python3",["-c",`import zipfile,pathlib,sys,json
records={'resonant-quantum-mechanics':'app-6aa6f57730308191906618fb867f004e','waveengine':'app-6aa6f7b0b20c819192af846d6e6ee4dd','robotics-lab':'app-6aa6f7837d588191b63262aee7813039'}
root,first,second=map(pathlib.Path,sys.argv[1:])
for name,record in records.items():
 base=root/'connectors'/'chatgpt'/name; original=json.loads((base/'plugin.json').read_text()); filename=name+'-'+original['version']+'-portal-record.zip'; path=first/filename
 assert path.read_bytes()==(second/filename).read_bytes()
 with zipfile.ZipFile(path) as z:
  assert len(z.namelist())==9 and z.testzip() is None
  manifest=json.loads(z.read('plugin.json')); assert manifest['name']==record; manifest['name']=name; assert manifest==original
  for entry in z.namelist():
   if entry!='plugin.json': assert z.read(entry)==(base/entry).read_bytes()
 assert json.loads((base/'plugin.json').read_text())==original`,root,first,second],{stdio:"pipe"});
  }finally{rmSync(first,{recursive:true,force:true});rmSync(second,{recursive:true,force:true});}
 },60_000);

});
