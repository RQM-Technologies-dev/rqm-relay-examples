import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..");
const read = (path: string) => readFileSync(resolve(root, path), "utf8");

describe("quantum evidence guide", () => {
  it("keeps the one-qubit example complete and within documented bounds", () => {
    const source = read("fixtures/quantum-assurance-example.qasm");
    expect(source).toBe('OPENQASM 3.0;\ninclude "stdgates.inc";\nqubit q;\nh q;\n');
    expect(Buffer.byteLength(source, "utf8")).toBeLessThanOrEqual(65536);
    expect(/[^\x00-\x7F]/.test(source)).toBe(false);
  });

  it("discloses both tariffs, funding floor and internal-test scope", () => {
    const guide = read("connectors/quantum-circuit-assurance.md");
    for (const text of ["$0.01", "$0.10", "$5", "same underlying", "operator-reported internal", "No simulator or QPU ran", "not a customer testimonial"]) {
      // The shared-computation sentence uses ordinary prose rather than a tier claim.
      expect(guide.includes(text) || (text === "same underlying" && guide.includes("share the underlying"))).toBe(true);
    }
    expect(guide).toContain("does not establish that the algorithm does what you intended");
    expect(read("fixtures/quantum-assurance-example.PROVENANCE.md")).toContain("not a customer result");
  });

  it("requires exact approval and original-key recovery in the copyable prompt", () => {
    const guide = read("connectors/quantum-circuit-assurance.md");
    const prompt = guide.split("```text\n")[1]?.split("```")[0] ?? "";
    expect(prompt).toContain("Ask for my approval");
    expect(prompt).toContain("owner-saved spending policy");
    expect(prompt).toContain("Do not fund the account or change its policy");
    expect(prompt).toContain("Do not create a replacement purchase");
    expect(prompt).toContain("terminal result and\nreceipt");
  });
  it("keeps observed discovery distinct from exact-endpoint paid acceptance", () => {
    const guide = read("connectors/quantum-circuit-assurance.md");
    expect(guide).toContain("did not expose the backing MCP URL");
    expect(guide).toContain("does not establish the exact Claude endpoint");
    expect(guide).toContain("A new source-only assurance request selects a different catalog path, v2");
    expect(guide).toContain("did not verify a live paid preflight result");
  });

  it("holds paid assurance and permits only balanced preflight in the prompt", () => {
    const guide = read("connectors/quantum-circuit-assurance.md");
    const prompt = guide.split("```text\n")[1]?.split("```")[0] ?? "";
    expect(prompt).toContain("Do not run circuit-assurance-report-v1");
    expect(prompt).toContain("do not test another envelope with a purchase");
    expect(prompt).toContain("use its source-based request and only the balanced");
    expect(prompt).toContain("stop before spending");
    expect(prompt).toContain("submit one preflight job");
    expect(prompt).not.toContain("submit one job");
    expect(prompt).toContain("Never change its request envelope under the original idempotency key");
  });
});
