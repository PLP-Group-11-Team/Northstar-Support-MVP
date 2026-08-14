# AI Structured Output Contract

## 1. Purpose

This document defines the structured output contract for the AI intent-classification component of the Northstar Retail Support Deflection MVP.

The contract defines the minimum structured information the AI must return so that the n8n/Automation layer can determine:

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

- n8n / Automation workflow

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
7. **Workflow compatibility** — The structure should be straightforward for n8n to consume.
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