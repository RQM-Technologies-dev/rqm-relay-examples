import { describe, it, expect } from "vitest";
import { purchaseCommand } from "../src/command.js";
import { purchaseState } from "../src/protocol.js";
describe("explicit purchase boundary", () => {
 it("never signs when recovery state is missing", () => { expect(() => purchaseCommand("recover", false)).toThrow(); });
 it("requires recovery for an existing purchase", () => { expect(() => purchaseCommand("purchase", true)).toThrow(); expect(purchaseCommand("recover", true)).toBe("recover"); });
 it("requires an explicit new purchase", () => { expect(() => purchaseCommand(undefined, false)).toThrow(); expect(purchaseCommand("purchase", false)).toBe("purchase"); });
 it("fails closed for incomplete readiness", () => { expect(purchaseState({status:"ready"},200)).not.toBe("public"); });
});
