# AI Guardrails

## 1. Purpose

This document maps the risks defined for the Northstar Retail Support Deflection MVP to the control layer(s) responsible for handling them: prompt-level, workflow-level, data-level, or human escalation.

Prompt-level control means the AI is instructed not to do something. It does not mean the behavior is enforced or guaranteed — it means the model has been told not to, which is a probabilistic, not deterministic, safeguard. Where prompt-level control is the *only* layer, that is flagged explicitly as a known gap.

---

## 2. Risk Map

| Risk | Control Layer(s) | How It's Handled | Sufficient Alone? |
|---|---|---|---|
| Hallucinated order info | Prompt | BUSINESS DATA SAFETY section explicitly forbids claiming order status, shipping, delivery dates unless supplied by workflow | **No.** Prompt only stops the classifier from asserting this. The response-generation stage (not yet built) is the actual point where hallucination could reach the customer — this guardrail is incomplete until that prompt exists and is tested. |
| Fabricated refund policies | Prompt | BUSINESS DATA SAFETY forbids refund amount/eligibility claims | **No.** Same gap — real policy text needs to come from the Data team (open dependency) and be injected into response generation; nothing enforces this today. |
| Fabricated delivery dates | Prompt | Covered under BUSINESS DATA SAFETY | **No.** Same as above — classifier-level only. |
| Unsupported claims (general) | Prompt | General instruction not to invent business data | **No.** No automated check exists that scans AI output for unsupported claims before it reaches the customer. |
| Missing order information | Prompt | Rule 3, `missing_information` field | **Partial.** Prompt correctly signals when info is missing. Whether the workflow actually *acts* on this field (e.g., asks the customer for the order ID) is an n8n implementation dependency, not yet confirmed. |
| Invalid order IDs | **None confirmed** | Prompt only extracts an order ID if present (Rule 5/6) — it explicitly does *not* validate whether the order ID exists | **Gap.** Validation is assumed to belong to the Data/workflow layer, but this hasn't been confirmed with the Data team. This is a real open dependency, not just a formality. |
| Unsupported intents | Prompt | `UNKNOWN_UNSUPPORTED` intent + Rule 7/8 | **Yes, at classification stage.** Reliable as long as classification accuracy holds — needs test coverage (Day 2/3) to confirm, not just prompt wording. |
| Prompt injection | Prompt | Dedicated PROMPT INJECTION RESISTANCE section + Example 10 | **Partial.** Prompt-level instruction is the only defense currently in place. No workflow-level input sanitization exists. Acceptable for MVP scope, but should be named as a known limitation, not treated as solved. |
| Malicious user instructions | Prompt | Same as above | **Partial.** Same gap as injection — single-layer defense. |
| Sensitive information leakage | **None confirmed** | Not explicitly addressed anywhere in the current prompt | **Gap.** Nothing currently stops the AI from being asked to repeat back internal instructions, or from a customer query containing another customer's data being echoed. Needs explicit rule addition, and ideally a workflow-level check on what gets logged/displayed. |
| Incorrect structured output | Prompt | OUTPUT REQUIREMENTS section constrains schema | **No.** This is model-output trust, not validation. No JSON schema validation step exists on the n8n/workflow side yet — if the model deviates, nothing currently catches it before it hits downstream logic. |
| Ambiguous requests | Prompt | Rule 8/9, `clarification_required` field, Example 7 | **Partial.** Classification-level handling is solid and tested via example. What the workflow does with `clarification_required = true` (how it actually asks the customer) is undefined — n8n dependency. |

---

## 3. Summary of Confirmed Gaps

These are not yet covered by any control layer and should be treated as open risks, not resolved ones:

1. **Order ID validation** — no confirmed layer owns this. Needs Data team input.
2. **Sensitive information leakage** — no prompt rule exists yet; needs to be added.
3. **Structured output validation** — no schema-validation step confirmed on the n8n side; currently 100% trust in model compliance.
4. **Response-generation-stage hallucination** — all current hallucination controls apply only to the classifier. The response-generation prompt (not yet written) is where customer-facing hallucination risk actually lives, and it currently has zero guardrails because it doesn't exist yet.

---

## 4. Status

**Version:** 0.1 — Draft-review needed
**Depends on:** `classification-prompt.md`, `output-schema.md`, `requirements.md`
