import {describe,it,expect} from "vitest";
import {approvedListing,externalPurchasingReady} from "../src/listings.js";
describe("explicit listing route selection",()=>{
 it("refuses imported and direct-connect records without loading a signer",async()=>{
  for(const access of ["listed","connect_directly"])await expect(approvedListing("example",(async()=>Response.json({id:"example",access,providerId:"p",capabilityId:"extract-v1",firstParty:false})) as typeof fetch)).rejects.toThrow("no approved");
 });
 it("pins the approved provider and never follows a provider URL",async()=>{
  const urls:string[]=[];const route=await approvedListing("example",(async(url,init)=>{urls.push(String(url));expect(init?.redirect).toBe("error");return Response.json({id:"example",access:"run_through_relay",providerId:"p",capabilityId:"extract-v1",firstParty:false});}) as typeof fetch);
  expect(route.providerId).toBe("p");expect(urls).toEqual(["https://api.rqm-relay.com/v1/listings/example"]);
 });
 it("never infers external admission from first-party readiness",()=>{
  expect(externalPurchasingReady({status:"ready",flags:{firstPartyExecutionEnabled:true,buyerPaymentEnabled:true,mainnetEnabled:true},mode:{ready:true,accountCoreCompatible:true,payerAccessMode:"public",publicPurchaseLimits:{admission_enabled:true}}},200)).toBe(false);
 });
});
