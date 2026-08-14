# Intent Classification Specification

## 1. Purpose

This document defines the behavior and decision boundaries for the AI intent classifier used in the Northstar Retail Support Deflection MVP.

The classifier converts a customer's natural-language support request into a structured representation that can be consumed by the n8n workflow.

The classifier is responsible for understanding the customer's request.

It is not responsible for retrieving or validating factual business data.

---

## 2. Supported Intents

The classifier must use exactly three intents for the MVP:

- `ORDER_STATUS`
- `RETURNS_REFUNDS`
- `UNKNOWN_UNSUPPORTED`

No additional intents should be introduced unless the MVP requirements are explicitly expanded.

---

## 3. Classification Principle

Classification must be based primarily on the customer's underlying request, not on whether the customer has supplied every piece of information required to fulfill that request.
Customer:
> "I want to return this, it's broken."

Expected intent:
RETURNS_REFUNDS

Note: Classified as RETURNS_REFUNDS even without an order ID —
missing information triggers separate handling (see Section 9,
requirements.md), not a different intent.

### Example

Customer:

> "Where is my order?"

Expected intent:

```text
ORDER_STATUS
