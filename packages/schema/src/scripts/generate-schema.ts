/**
 * Generate JSON Schema from Zod schemas
 */

import { z } from "zod";
import { writeFileSync } from "node:fs";
import { TokenFileSchema } from "../index";

const jsonSchema = z.toJSONSchema(TokenFileSchema);

// Add metadata to the schema
const schemaWithMeta = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  title: "DTCG Design Tokens",
  description: "W3C Design Tokens Community Group Specification 2025.10",
  ...jsonSchema,
};

const output = JSON.stringify(schemaWithMeta, null, 2);

writeFileSync("../../dtcg.schema.json", output);

console.log("Generated dtcg.schema.json");
