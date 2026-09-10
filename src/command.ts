/** Recovery is incapable of creating a new purchase, even with a buyer key set. */
export function purchaseCommand(value: string | undefined, saved: boolean): "purchase" | "recover" {
  if (value !== "purchase" && value !== "recover") throw new Error("Choose purchase or recover explicitly.");
  if (value === "recover" && !saved) throw new Error("Original recovery file required. No payment authorized.");
  if (value === "purchase" && saved) throw new Error("Purchase already exists. Use recover with this file.");
  return value;
}
