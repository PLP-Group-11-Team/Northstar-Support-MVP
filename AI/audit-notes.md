# AI Contribution Audit

**Purpose:** Review of AI/Prompt Engineering commits, prompt versions, test results, and documentation against the Definition of Done criteria, per sprint requirements section 4/17.



---

## 1. Method

Audited by pulling the actual repository state and cross-checking:
- File contents at each commit vs. commit message claims
- Current `AI/` folder contents vs. the Day 1 deliverables list
- `known-issues.md` accuracy against latest state
- Test evidence (`evaluation-set-v1.md`, response-generator test results) for completeness

---

## 2. Critical Finding — Empty File Commits

**Issue:** Six files were committed to GitHub with content, non-empty according to their commit messages, but were actually **0 bytes** in the repository:

- `AI/requirements.md`
- `AI/guardrails.md`
- `AI/intent-classification.md`
- `AI/response-generator.md`
- `AI/evaluation-set-v1.md`
- `AI/prompts-iterations.md` *(also misnamed — should have been `prompt-iterations.md`)*

**Root cause:** Content was drafted and reviewed during Day 1-3 work sessions but not actually saved into the local files before `git add`/`git commit` was run — likely a paste/save step skipped between drafting and committing.

**Impact if undetected:** Day 5 delivery and any external review (e.g., a real teammate or grader opening the repo) would have found a GitHub history describing five completed deliverables that were, in reality, blank files — despite the underlying work genuinely having been done and reviewed in conversation.

**Correction:**
- All six files' content was restored from the original drafts.
- Misnamed duplicate (`prompts-iterations.md`) removed via `git rm`.
- Fixes committed under an honest message describing the correction, not disguised as a first-time addition.
- Two files (`classification-prompt.md`, `output-schema.md`) and `known-issues.md` were confirmed to have been correctly committed with real content throughout — this was not a universal failure, just an inconsistent one across specific files.

**Status:** Resolved.

---

## 3. Secondary Finding — Duplicate Commits

Two commits (`dc79a33` and `09dddae`) carry the identical message "docs: define AI requirements and support intents - establishes MVP classification scope." The first added no file changes; the second created `requirements.md` (empty, per Finding 1).

**Decision:** Left as-is rather than rewriting history this late in the sprint — history rewrites carry their own risk of introducing new errors under time pressure. Noted here for transparency rather than silently corrected.

**Status:** Acknowledged, not corrected (accepted risk).

---

## 4. Verified Solid (No Issues Found)

- `classification-prompt.md` — real content at every commit, versioned correctly (v0.1 → v0.3), changes match `prompt-iterations.md` log.
- `output-schema.md` — real content, correctly updated to reflect the automation layer confirmation and field-level spec.
- `known-issues.md` — accurate and complete as of Day 3 close; still accurate as of this audit.
- Test evidence: 15/15 (Round 1 classifier), 7/8 pass with 1 real failure found and fixed (Round 2 classifier), 5/5 (Round 1 response-generator), 3/3 (Round 2 response-generator). All outputs were genuinely run against a real model, not fabricated or assumed.
- Prompt iteration log (once restored) accurately documents both real fixes with cause, change, and retest evidence — meets the evidence-based iteration standard required by the sprint brief.

---

## 5. Outstanding Items (Unchanged by This Audit — See `known-issues.md`)

1. Order ID validation ownership unconfirmed (Data team)
2. Sensitive information leakage — no explicit rule yet
3. No JSON schema validation step on automation's side
4. Data-context contract (response-generator input) undocumented
5. Regression test of original 15 classifier cases against v0.3 — deferred, not completed
6. `order_id` assumed required for `RETURNS_REFUNDS` lookups — unconfirmed with Data team

None of these are newly discovered; all were already honestly flagged in `known-issues.md` prior to this audit. They remain open going into Day 5 and should be reflected in the final AI Limitations section of the Go-Live Readiness Note, not presented as resolved.

---

## 6. Audit Conclusion

The AI component's actual design and test work is sound — the core issue found was a **GitHub evidence/process gap**, not a design or reliability gap. All prompts, guardrails, and test results reviewed in this audit reflect genuine work; the risk was that the repository failed to reflect that work accurately until corrected today.

**Recommendation for Day 5:** No redesign needed. Focus remaining time on: (a) deciding whether any of the 6 outstanding items in section 5 can be closed before delivery, and (b) writing the final AI Limitations and Go-Live documentation honestly reflecting what remains open.