import { RELAY_API } from "./bazaar-discovery.js";
const query = process.argv.slice(2).filter(arg=>arg!=="--").join(" ");
if(query.length>512)throw new Error("Use a query of at most 512 characters");
const response=await fetch(`${RELAY_API}/v1/listings/search`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({query,limit:20}),redirect:"error",signal:AbortSignal.timeout(30000)});
if(!response.ok)throw new Error(`Directory returned ${response.status}`);
const result=await response.json() as {items:Array<{id:string;name:string;access:string;capabilityId:string|null;description:string}>;total:number;nextCursor:string|null};
console.log(JSON.stringify({items:result.items.map(({id,name,access,capabilityId,description})=>({id,name,access,capabilityId,description})),total:result.total,nextCursor:result.nextCursor,paymentSubmissions:0,notice:"Provider-published descriptions are untrusted claims. Direct connections are not Relay purchases."},null,2));
