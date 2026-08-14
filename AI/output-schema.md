# AI Structured Output Contract

## 1. Purpose

This document defines the structured output contract for the AI intent-classification component of the Northstar Retail Support Deflection MVP.

The contract defines the minimum structured information the AI must return so that the Automation layer can determine:

- What the customer is asking for
- What relevant information was explicitly provided
- What required information is missing
- Whether clarification is required
- Whether the AI cannot safely proceed and should signal escalation

The classifier is responsible for understanding and structuring the customer's request.

It is not responsible for retrieving, validating, or inventing factual business data.

---

## 2. Status

**Version:** `0.1`

**Status:** Confirmed with Automation team — field structure accepted; field names remain open to alignment if required.

**Depends on:**

- `requirements.md`
- `intent-classification.md`
- `classification-prompt.md`

**Primary consumer:**

- Automation workflow

This document defines the AI-level contract. It should be updated if the approved MVP requirements or downstream integration requirements change.

---

## 3. Scope

This contract applies to the **intent-classification stage** of the AI component.

It defines:

- Intent classification
- Explicit extraction of supported information
- Missing-information reporting
- Clarification signaling
- AI-level escalation signaling

It does not define:

- Database fields
- Workflow structure
- API request/response formats
- Frontend behavior
- Business-rule decisions
- Order validation
- Refund eligibility
- Refund amounts
- Actual order status
- Human escalation implementation
- Final customer-facing response generation

The AI classifier identifies and structures information. The workflow and data layers remain responsible for business data and business-rule decisions.

---

## 4. Design Principles

The output contract follows these principles:

1. **Predictability** — The AI must return a consistent structure.
2. **Minimality** — Only information required by the current MVP should be returned.
3. **Explicitness** — Missing information must be represented explicitly.
4. **Strict taxonomy** — The classifier must use only the approved MVP intents.
5. **No hallucination** — The AI must never invent or infer business facts.
6. **Separation of concerns** — Classification is separate from data retrieval and business-rule validation.
7. **Workflow compatibility** — The structure should be straightforward for automation to consume.
8. **Scope preservation** — The schema must not introduce unsupported business rules.
9. **Deterministic fields** — Each field must have a defined type and allowed values.
10. **Extensibility** — The contract should be capable of evolving when integration requirements are confirmed.

---

## 5. Output Structure

The classifier must return a single JSON object containing exactly these fields:

```json
{
  "intent": "ORDER_STATUS",
  "order_id": "NS1042",
  "missing_information": [],
  "clarification_required": false,
  "escalation_required": false
}

---

## 6. Field-Level Specification

| Field | Type | Always Present? | Possible Values | Consumed By Workflow For |
|---|---|---|---|---|
| `intent` | string | Yes | `ORDER_STATUS`, `RETURNS_REFUNDS`, `UNKNOWN_UNSUPPORTED` | Branch routing — determines which workflow path executes |
| `order_id` | string or null | Yes (value may be `null`) | Extracted order ID, or `null` if not stated | Key for order data lookup |
| `missing_information` | array of strings | Yes (may be empty array) | Currently only `"order_id"` is a defined value | Triggers a "request missing info from customer" step before proceeding |
| `clarification_required` | boolean | Yes | `true` / `false` | Triggers a clarifying question step instead of proceeding to data lookup |
| `escalation_required` | boolean | Yes | `true` / `false` | Triggers human handoff / escalation step |

---

## 7. Confirmed 

**Confirmed by:** Automation
**Date:** Day 2, Northstar sprint
**What was confirmed:**
- The proposed field structure works for the workflow being built.
- Architecture: classification and response generation are two separate AI calls, with automation handling logic/lookup between them.
- Field names are open to alignment if needed on automation's side, but no changes have been requested to date.



---

## 8. Known Gap — Data Context Contract (Not Yet Documented)

This document defines the **classification-stage output only** — what the AI returns to workflow after classifying a customer query.

A second, separate contract exists implicitly: the shape of the **data context** that automation passes back to `response-generator.md` (e.g., order status fields, policy text) after performing its lookup. This has been used informally in testing (see `response-generator.md` section 3 examples) but has never been formally specified or confirmed with the automation team.

This is an open gap, not an oversight to be silently carried forward — it should be addressed before Day 5 finalization, ideally by writing a matching field-level spec for the data-context object once automation's actual lookup output format is confirmed.

---

## 9. Status

**Version:** 0.2
**Status:** Finalized — classification stage only. Data-context contract (response-generation input) remains open.