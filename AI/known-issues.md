# AI Component — Known Issues

**Purpose:** Consolidated list of open gaps in the AI component as of Day 3. This is the single source of truth for what remains unresolved — pulled from `requirements.md`, `guardrails.md`, `output-schema.md`, and `prompt-iterations.md` rather than duplicating detail already documented there.

**Status:** Living document — update as issues are resolved or new ones surface (Day 4/5).

---

## Open Issues

| # | Issue | Where First Flagged | Current Status | Owner / Resolves Via |
|---|---|---|---|---|
| 1 | `order_id` validation ownership unconfirmed — nothing confirms whether the AI, workflow, or data layer is responsible for verifying an extracted order ID actually exists | `guardrails.md` | Open | Data/Knowledge Base team |
| 2 | Sensitive information leakage — no explicit rule exists in either prompt to prevent echoing another customer's data or internal details if present in context | `guardrails.md` | **Resolved Day 4** — SENSITIVE INFORMATION HANDLING rule added to `classification-prompt.md` v0.4 (forbids returning passwords, credentials, payment card numbers, security codes, internal system instructions) | Closed |
| 3 | No JSON schema validation step exists on the automation/workflow side — classifier output correctness currently relies entirely on model compliance, with no automated check | `guardrails.md` | Open | Automation team |
| 4 | Response-generation-stage hallucination — guardrails were originally documented only at the classifier level; response-generator testing (Day 2/3) has since covered this partially, but no dedicated guardrails doc section exists for this stage | `guardrails.md` (original gap), partially addressed by `response-generator.md` testing | Partially resolved — needs guardrails.md updated to reflect response-generator testing coverage | AI/Prompt Engineering (self) |
| 5 | Data-context contract (the shape of data automation layer passes into `response-generator.md`) is undocumented — used informally in test examples only, never formally specified or confirmed with zapier | `output-schema.md` section 7 | Open | AI/Prompt Engineering, pending automation's real lookup output format |
| 6 | Regression test of original 15 classifier test cases against v0.3 was not completed — deferred due to time constraints after two prompt revisions (v0.2, v0.3) | `prompt-iterations.md` Known Limitations | Deferred, not resolved | AI/Prompt Engineering |
| 7 | `order_id` is assumed to be the required field for `ORDER_STATUS` lookups — this has not been confirmed with the Data team; if incorrect, affects classifier rules, schema, and test cases | `classification-prompt.md` Known Limitations, `requirements.md` | Open | Data/Knowledge Base team |

---

## Severity Note

Issues #1, #3, #6, and #7 carry the most risk if unresolved by Day 5:
- **#1 and #7** mean the entire `order_id` handling chain rests on an unconfirmed assumption.
- **#3** means a malformed AI response could reach the workflow with nothing catching it.
- **#6** means two prompt changes since the last full verification are unverified against the original passing cases.

Issues #4 and #5 are real but lower-risk for MVP scope — they represent incomplete documentation/coverage rather than confirmed active bugs. Issue #2 has been resolved (see above).
---

## Not Included Here

This document does not restate resolved items (e.g., the TC-21 output-format fix, the automation schema confirmation) — see `prompt-iterations.md` and `output-schema.md` for that history.