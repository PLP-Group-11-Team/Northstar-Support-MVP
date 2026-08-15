# AI Output Schema Validation Spec

## 1. Purpose

This document specifies how the Automation workflow should validate the AI classifier's JSON output before acting on it. It does not implement the validation — that is automation layer's responsibility, per the AI/workflow boundary defined in `requirements.md` section 8. This document exists to close `known-issues.md` #3 by giving automation layer a precise, ready-to-implement specification, converting an undefined risk into a scoped handoff.

---

## 2. Why This Is Needed

`classification-prompt.md` instructs the model to always return a specific JSON shape, including on refusal (see v0.2 changelog, which fixed TC-21's format break). However, prompt instructions are a probabilistic control, not a guarantee (see `guardrails.md` section 1). Nothing downstream currently checks that the AI's actual output conforms to the expected shape before automation layer acts on it. A malformed or unexpected response reaching workflow logic unchecked could cause silent failures or incorrect routing.

---

## 3. Expected Output Shape

```json
{
  "intent": "ORDER_STATUS | RETURNS_REFUNDS | UNKNOWN_UNSUPPORTED",
  "order_id": "string or null",
  "missing_information": [],
  "clarification_required": true,
  "escalation_required": false
}
```

## 4. Field-Level Validation Rules

| Field | Required | Type | Valid Values | Fails Validation If |
|---|---|---|---|---|
| `intent` | Yes | string | Exactly one of: `ORDER_STATUS`, `RETURNS_REFUNDS`, `UNKNOWN_UNSUPPORTED` | Missing, wrong type, or any value outside the three listed |
| `order_id` | Yes (key must exist) | string or null | Any string, or `null` | Key missing entirely; value is a number, object, or array instead of string/null |
| `missing_information` | Yes | array of strings | Currently only `"order_id"` is a defined value; empty array `[]` is valid | Key missing; value is not an array; array contains anything other than strings |
| `clarification_required` | Yes | boolean | `true` or `false` | Missing, or value is a string (`"true"`) instead of a real boolean |
| `escalation_required` | Yes | boolean | `true` or `false` | Missing, or value is a string instead of a real boolean |

## 5. Structural Rules (Whole-Object Level)

- The response must be a single, valid JSON object — not a JSON array, not multiple objects, not JSON wrapped in markdown code fences or accompanied by natural-language text.
- No additional fields beyond the five listed above should be present. An unexpected extra field should be treated as a validation failure, not silently ignored — it may indicate the model deviated from instructions in an untested way.
- If the raw response cannot be parsed as JSON at all (e.g., prose, partial JSON, empty string), this is an automatic validation failure.

## 6. Behavior on Validation Failure

If any rule in sections 4 or 5 is violated, the workflow should **not** proceed with the AI's output as given. Recommended fallback:

```json
{
  "intent": "UNKNOWN_UNSUPPORTED",
  "order_id": null,
  "missing_information": [],
  "clarification_required": false,
  "escalation_required": true
}
```

Rationale: a malformed response means the AI's actual intent cannot be trusted, so the safest default is to treat it the same as an unsupported/unsafe case and escalate to a human — consistent with `requirements.md` section 9's failure/escalation philosophy ("default to indicating escalation is needed rather than producing an unsupported claim").

This fallback object is a **suggested convention**, not something enforced by the AI itself — it must be implemented in the automation workflow logic, since validation happens after the AI call returns.

## 7. Suggested Implementation Approach 

A lightweight JSON Schema definition matching section 3-5 above could be validated using a Code step, Set step with conditional logic, or a JSON Schema validation node, depending on what's available in Zapier. This is intentionally left open — implementation approach is the automation team's decision, per the AI/workflow boundary in `requirements.md`.

Example JSON Schema (for reference, not required to be used verbatim):

```json
{
  "type": "object",
  "required": ["intent", "order_id", "missing_information", "clarification_required", "escalation_required"],
  "additionalProperties": false,
  "properties": {
    "intent": { "enum": ["ORDER_STATUS", "RETURNS_REFUNDS", "UNKNOWN_UNSUPPORTED"] },
    "order_id": { "type": ["string", "null"] },
    "missing_information": { "type": "array", "items": { "type": "string" } },
    "clarification_required": { "type": "boolean" },
    "escalation_required": { "type": "boolean" }
  }
}
```

## 8. Scope Note

This spec covers only the **classification-stage** output. The response-generation stage returns plain natural-language text (see `response-generator.md` section 2, OUTPUT: "no JSON, no markdown"), so it does not require schema validation in the same sense — though basic checks (non-empty response, reasonable length) may still be worth considering, out of scope for this document.

## 9. Status

**Version:** 0.1
**Depends on:** `classification-prompt.md`, `output-schema.md`
**Resolves:** `known-issues.md` #3 — spec ready, pending automation layer implementation. Not fully closed until automation layer confirms the validation is actually built.