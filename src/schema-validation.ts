import { Ajv } from "ajv";
import addFormats from "ajv-formats";

/** Match published standard JSON Schema formats before payment and after retrieval. */
export function schemaValidator() {
  const validator = new Ajv({ strict: false });
  addFormats.default(validator);
  return validator;
}
