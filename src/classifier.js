const Ajv = require("ajv");
require("dotenv").config();

const fs = require("fs");
const path = require("path");
const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});
const ajv = new Ajv();

const schemaPath = path.join(
  __dirname,
  "..",
  "schemas",
  "output-schema.json"
);

const outputSchema = JSON.parse(
  fs.readFileSync(schemaPath, "utf8")
);

const validateOutput = ajv.compile(outputSchema);

// Load the approved classification prompt.
const promptPath = path.join(
  __dirname,
  "..",
  "AI",
  "classification-prompt.md"
);

const classificationPrompt = fs.readFileSync(promptPath, "utf8");

async function classifyIntent(customerMessage) {
  if (!customerMessage || typeof customerMessage !== "string") {
    throw new Error("customerMessage must be a non-empty string");
  }

  const interaction = await ai.interactions.create({
    model: "gemini-3.5-flash",

    // System-level instructions belong here,
    // not as role: "system" inside input.
    system_instruction: classificationPrompt,

    input: customerMessage
  });

  const output = interaction.output_text;

  if (!output) {
    throw new Error("Gemini returned an empty response");
  }

  let result;

try {
  result = JSON.parse(output);
} catch (error) {
  throw new Error(
    `Gemini returned invalid JSON: ${output}`
  );
}

if (!validateOutput(result)) {
  console.error("Schema validation errors:", validateOutput.errors);

  throw new Error(
    "Gemini response failed output schema validation"
  );
}

return result;
}

module.exports = {
  classifyIntent
};