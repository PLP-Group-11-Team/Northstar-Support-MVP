# AI Component — Limitations

**Purpose:** An honest, external-facing statement of what the Northstar AI component does and does not do, for anyone reviewing, demoing, or extending the MVP. This is a companion to `known-issues.md` (the internal working tracker) — this document states scope and boundaries plainly, once, without apology or overstated reliability claims.

---

## 1. By Design — Intentional MVP Scope Choices

These are not gaps to be fixed later; they were deliberate decisions to keep the 5-day MVP achievable and defensible.

- **Only three intents are supported:** `ORDER_STATUS`, `RETURNS_REFUNDS`, `UNKNOWN_UNSUPPORTED`. Stock Availability and any other request type are explicitly out of scope and always classify as `UNKNOWN_UNSUPPORTED`.
- **No multi-intent handling.** A query containing more than one distinct request (e.g., asking about order status and returns in the same message) is not split or answered partially — it classifies as `UNKNOWN_UNSUPPORTED` with `clarification_required: true`, asking the customer to submit one request at a time (Rule 11).
- **No conversation memory.** Each query is classified statelessly; the AI does not retain context across messages.
- **The AI never verifies business data.** It classifies intent and extracts explicitly stated information (e.g., an order ID), but does not look up, confirm, or validate whether an order or refund actually exists — that is the workflow/data layer's responsibility, by design (`requirements.md` section 8).
- **No confidence scoring.** The classifier returns a definitive intent, not a probability or confidence value.
- **Response generation is a separate, stateless model call** from classification — it only knows what it's given (classification result + supplied data context), nothing more.

---

## 2. Open Gaps — Unresolved, Not Yet Decided

These are real limitations that remain open as of Day 5 delivery.

| Gap | Current State |
|---|---|
| `order_id` validation ownership | Not confirmed with the Data team — assumed to belong to the workflow/data layer, but not formally agreed |
| `order_id` as the required field for `RETURNS_REFUNDS` lookups | Unconfirmed assumption baked into the classifier and test set |
| JSON output schema validation on automation layer's side | Not yet implemented — a spec exists (`schema-validation-spec.md`) ready for automation layer to build against, but nothing enforces it today |
| Data-context contract (input to response-generator) | Used informally in testing; never formally specified or confirmed with automation layer |
| Regression test of the original 15 classifier cases against the current prompt version (v0.4) | Deferred twice during the sprint due to time constraints; the prompt has changed 3 times since the original 15 were last verified in full |

---

## 3. Test Coverage — What's Verified and What Isn't

**Verified (real model outputs recorded, not assumed):**
- Classifier, Round 1: 15/15 test cases passing (normal queries, paraphrases, missing info, unsupported, ambiguous, injection)
- Classifier, Round 2: 7 additional cases covering harder paraphrases, multi-intent, and adversarial inputs — 1 failure found and fixed (TC-21, format break on refusal), retested and passing
- Response-generator, Round 1: 5/5 cases passing, including the highest-risk "order not found" case with zero fabrication
- Response-generator, Round 2: 3/3 cases passing, including real-fact surfacing, partial data handling, and an injection attempt embedded in the data context itself

**Not verified:**
- The original 15 classifier cases have not been rerun against the current prompt version (v0.4) — see gap above
- No load or scale testing has been performed
- No testing against real production order/policy data — all test data is illustrative/placeholder
- No end-to-end testing with the actual Zapier workflow has occurred; integration has been validated only through team confirmation and shared schema documentation, not a live run

---

## 4. Summary Statement

The AI component reliably classifies the three supported intents and generates grounded, non-fabricated responses across all test cases run to date, including targeted adversarial and edge-case testing. It has not been proven bulletproof — the deferred regression test and the absence of end-to-end integration testing are the two most significant remaining unknowns going into any live demo or further development.

---

## 5. Version

**Status:** Final — Day 5 sprint delivery
**References:** `known-issues.md`, `prompt-iterations.md`, `guardrails.md`, `evaluation-set-v1.md`, `schema-validation-spec.md`