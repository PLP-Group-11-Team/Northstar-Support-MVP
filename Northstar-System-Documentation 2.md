# Northstar Retail Support Deflection MVP — System Documentation

**Repository:** [PLP-Group-11-Team/Northstar-Support-MVP](https://github.com/PLP-Group-11-Team/Northstar-Support-MVP)
**Document type:** Technical/system documentation, written from a direct audit of the repository contents.
**Purpose:** The `README.md` at the repo root is the sprint _plan_ (workflow, taxonomy, sprint schedule, definitions of done). This document describes what has actually been **built**, how the pieces do and don't connect, and where the real implementation diverges from the plan — so it can double as the technical backbone of the Day 5 Go-Live Readiness Note.

---

## Contributors / Role Players

Roles below are as reported by the team. Repository evidence corroborates the automation role directly — the commit inspected in Section 6 was authored by this account, and the n8n webhook URL hardcoded into `frontend/src/services/supportService.ts` (`adeshissack27.app.n8n.cloud`) is hosted under the same username. The other role-to-file mappings below are as reported, not independently verified against per-file commit history — GitHub's public API was rate-limited at the time of writing, so file-level attribution wasn't cross-checked commit-by-commit.

| Role                 | GitHub                                                               | Primary area                                                                         |
| -------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Automation & Testing | [@adeshissack27-arch](https://github.com/adeshissack27-arch)         | n8n workflow, Zapier export, CI deploy pipeline, evaluation/test scripts             |
| AI & Backend         | [@manmungadr-creator](https://github.com/manmungadr-creator)         | `AI/` prompts, requirements, guardrails, evaluation; `src/` classifier + Express API |
| Frontend             | [@mbogo756](https://github.com/mbogo756)                             | `frontend/` — React/TypeScript/Vite chat UI                                          |
| Data                 | [@odhiamboakinyivallarie](https://github.com/odhiamboakinyivallarie) | `data/` — orders and returns/refund policy test data                                 |
| Documentation Owner  | [@tiisetsokutu44-hub](https://github.com/tiisetsokutu44-hub)         | Project-level documentation, sprint evidence, this document's upkeep                 |

This maps onto the six components defined in the root `README.md` as: Automation & Testing covers both **Automation** and **QA/Integration**; AI & Backend covers **AI/Prompt Engineering** (the `AI/` folder is thoroughly documented and tested — see Section 4); the remaining three map one-to-one. No single named owner currently covers the **Documentation Owner's own dependency** — reconciling the four conflicting automation paths in Section 3 — since that decision sits across Automation, AI & Backend, and Frontend jointly rather than any one role.

---

## 1. Executive Summary

The **AI/Prompt Engineering component is the most mature part of this repository.** It has a real requirements doc, a versioned classification prompt (v0.4) with a documented iteration history, a schema, a validation spec, and genuine test evidence (15/15 Round 1, 7/8 Round 2 classifier cases; 5/5 + 3/3 response-generator cases) run against a real model — plus an honest audit (`AI/audit-notes.md`) that caught and fixed six empty-file commits before delivery.

The **integration layer is where the gaps are.** Four separate implementations of "get a customer message from the frontend to a classification result and back" exist in this repo, and they don't share a single path:

| #   | Path                                      | Classifier used                                    | Wired to frontend?                     |
| --- | ----------------------------------------- | -------------------------------------------------- | -------------------------------------- |
| 1   | `frontend/` → n8n webhook                 | Client-side keyword matching (`supportService.ts`) | **Yes — this is what actually runs**   |
| 2   | `Northstar-MVP- ZAP.JSON` (Zapier export) | Regex/keyword Code step                            | No — incomplete file, not connected    |
| 3   | `src/server.js` + `src/classifier.js`     | Real LLM (Gemini) using the documented prompt      | No — nothing calls it                  |
| 4   | `server/index.js` (webhook + polling)     | N/A — forwards to `AUTOMATION_WEBHOOK_URL`         | No — frontend doesn't call this server |

In short: **the carefully designed, tested, LLM-based classifier described throughout `AI/` is not the classifier that runs when a customer actually uses the deployed chat UI.** The chat UI uses a simple keyword check written directly in `frontend/src/services/supportService.ts`. This isn't called out anywhere in the current docs and is the single most important finding for a Go-Live Readiness Note. Section 3 below lays out exactly why.

None of this means the AI work is wasted — `src/` is a working, tested reference implementation of the documented design. It just isn't in the live request path yet.

---

## 2. Actual Repository Structure

```
.
├── .github/workflows/deploy-pages.yml   # CI: builds frontend, deploys to GitHub Pages
├── AI/                                  # AI/Prompt Engineering deliverables (see Section 4)
│   ├── requirements.md
│   ├── intent-classification.md
│   ├── classification-prompt.md         # v0.4 — the actual LLM system prompt
│   ├── output-schema.md
│   ├── schema-validation-spec.md
│   ├── response-generator.md            # v0.1 LLM prompt for customer-facing replies
│   ├── guardrails.md
│   ├── evaluation-set-v1.md
│   ├── prompt-iterations.md
│   ├── known-issues.md
│   ├── limitations.md
│   └── audit-notes.md
├── data/                                # Fictional test data (confirmed no real PII)
│   ├── orders.json / Northstar support data - Orders.csv
│   ├── returns-policy.json / Northstar support data - Policy.csv
│   └── README.md
├── schemas/
│   └── output-schema.json               # JSON Schema used for real Ajv validation in src/
├── src/                                 # Working Node/Express reference implementation
│   ├── classifier.js                    # Calls Gemini, validates output against schema
│   ├── orderService.js                  # Looks up orders.json by order_id
│   ├── policyService.js                 # Keyword-matches returns-policy.json
│   ├── responseService.js               # Deterministic template responses (not LLM-based)
│   ├── supportService.js                # Orchestrates the above end to end
│   └── server.js                        # Express API on :3000 (/api/classify, /api/support)
├── server/                              # A second, separate Express server
│   └── index.js                         # :5000 — webhook dispatch + polling pattern
├── frontend/                            # React + TypeScript + Vite chat UI
│   └── src/
│       ├── App.tsx                      # Chat interface
│       ├── services/supportService.ts   # Calls an n8n webhook directly (see Section 3)
│       └── types/chat.ts
├── tests/
│   ├── evaluation.js                    # Runs the 15 classifier cases against localhost:3000
│   ├── orderService.test.js             # Manual smoke-test script (console.log, no assertions)
│   ├── policyService.test.js            # Same
│   └── responseService.test.js          # Same
├── Northstar-MVP- ZAP.JSON              # Zapier workflow export — incomplete (see Section 3.2)
├── package.json                         # Root: `npm start` → src/server.js
└── README.md                            # Sprint plan (not setup instructions)
```

---

## 3. Architecture: As Designed vs. As Built

### 3.1 As designed (per root `README.md`)

```
Customer → Frontend/Chatbot → Automation → AI Intent Classification
         → Knowledge Base → AI Response Generation → Customer
```

One workflow, one classifier, one response generator, automation in the middle.

### 3.2 As built — four parallel paths

**Path 1 — What's actually live: `frontend/` → n8n**

`frontend/src/services/supportService.ts` posts directly to a hardcoded webhook:

```
https://adeshissack27.app.n8n.cloud/webhook/Northstar-support
```

Before it ever reaches that webhook, the frontend does its **own** intent detection locally:

```ts
function detectType(messageText: string): "order" | "return" {
  // substring checks for "return", "refund", "damaged", "wrong item", "exchange"
  // → 'order' otherwise
}
function extractOrderId(messageText: string): string | null {
  // regex: /NS\d{4,}/
}
```

This is a two-bucket keyword classifier (`order` / `return`), not the three-intent (`ORDER_STATUS` / `RETURNS_REFUNDS` / `UNKNOWN_UNSUPPORTED`) taxonomy defined in `AI/requirements.md`. There is no `UNKNOWN_UNSUPPORTED` bucket in the live path at all — every message that isn't clearly a return gets routed as an order query. None of the guardrails, prompt-injection resistance, or missing-information handling documented in `AI/` apply here, because no LLM is called on this path.

**Path 2 — `Northstar-MVP- ZAP.JSON`**

This is a genuine Zapier workflow export (`app: "EngineAPI"`, `WebHookCLIAPI`, `CodeCLIAPI` are Zapier's internal engine identifiers — the filename's "ZAP" is accurate). Its Code step implements its _own_ independent regex classifier:

```js
if (/\b(order|status|shipping|delivery|tracking|confirmation|where|when|track)\b/.test(normalizedMessage)) {
  intent = 'ORDER_STATUS';
  ...
} else if (/\b(return|refund|exchange|send back|money back|cancel|wrong item)\b/.test(normalizedMessage)) {
  intent = 'RETURNS_REFUNDS';
}
```

This one _does_ use the three-value taxonomy and does mirror some of the documented field names (`missing_information`, `clarification_required`, `escalation_required`) — but it's still a hand-written regex classifier, not the LLM prompt from `classification-prompt.md`, and it can't handle any of the paraphrase/ambiguity/injection cases that prompt was specifically tested against. The file itself is also incomplete: it ends with a literal `// ... (rest of your steps)` comment, which additionally makes the file invalid JSON — it can't be re-imported into Zapier as-is.

**Path 3 — `src/` (the actual documented design, but disconnected)**

This is the only implementation that matches `AI/` end to end:

- `src/classifier.js` loads `AI/classification-prompt.md` as the system instruction, calls Gemini (`gemini-3.5-flash` via `@google/genai`), parses the JSON response, and validates it against `schemas/output-schema.json` with Ajv — which is a real, working implementation of the validation `AI/schema-validation-spec.md` asks the _automation_ layer to build. `known-issues.md` #3 currently says this is unresolved; it's arguably resolved here, just not where the doc expects it.
- `src/supportService.js` orchestrates classification → order/policy lookup → response, matching the intended architecture closely.
- `src/responseService.js`, however, builds replies from fixed string templates, not from the LLM response-generation prompt in `AI/response-generator.md`. That prompt has its own genuine test results (5/5, then 3/3) but nothing in `src/` loads or calls it — the `openai` package is listed in `package.json` dependencies but isn't imported anywhere in the codebase. The tested prompt and the running code are two different implementations of the same responsibility.
- `src/server.js` exposes this as an Express API on port 3000 (`/api/classify`, `/api/order`, `/api/support`), and `tests/evaluation.js` runs the real 15-case evaluation set against it over HTTP.
- **Nothing calls this server.** The frontend talks to n8n, not to `localhost:3000`.

**Path 4 — `server/index.js`**

A fourth, separate Express server (port 5000) implementing an async webhook + polling contract: `POST /api/support/request` dispatches to an `AUTOMATION_WEBHOOK_URL` env var and returns a `requestId`; a separate `/api/support/callback` and `/api/support/result/:requestId` complete the loop. This looks like an attempt to bridge the frontend and an automation workflow properly, and `frontend/.env.example` (`VITE_API_BASE_URL=http://localhost:5000`) suggests the frontend was _meant_ to call it — but the actual `supportService.ts` code calls the n8n webhook directly instead, bypassing this server entirely.

### 3.3 Why this matters

`AI/limitations.md` already states, honestly: _"No end-to-end testing with the actual Zapier workflow has occurred; integration has been validated only through team confirmation and shared schema documentation, not a live run."_ The above confirms that caveat was correct and understates the gap slightly — it's not just that Path 1–3 haven't been tested together, it's that they're genuinely different classifiers with different behavior, and the one that's live in the browser is the least sophisticated of the three.

This is a normal outcome for a 5-day, multi-track student/simulated sprint where AI, automation, and frontend tracks build in parallel against a shared contract rather than a shared runtime — but it should be stated plainly in the Go-Live Readiness Note rather than left implicit.

---

## 4. AI Component — Summary of What's Documented and Tested

This section summarizes `AI/` rather than duplicating it; see the individual files for full detail.

**Intent taxonomy** (`requirements.md`, `intent-classification.md`): exactly three intents — `ORDER_STATUS`, `RETURNS_REFUNDS`, `UNKNOWN_UNSUPPORTED` — with a clear rule that a missing `order_id` does not demote a request to `UNKNOWN_UNSUPPORTED`.

**Classification prompt** (`classification-prompt.md`, v0.4): a single system prompt covering intent rules, an 11-item returns/refunds policy-topic taxonomy, 11 numbered classification rules, order-ID extraction rules, prompt-injection resistance, and a sensitive-information-handling rule added in v0.4. Twenty worked examples are included. Version history:

- v0.2 — fixed a real failure (TC-21: a system-prompt-extraction attempt broke JSON output format).
- v0.3 — formalized multi-intent handling (Rule 11) based on observed behavior.
- v0.4 — added sensitive-information handling (closing `known-issues.md` #2).

**Output contract** (`output-schema.md`, `schemas/output-schema.json`): five required fields — `intent`, `order_id`, `missing_information`, `clarification_required`, `escalation_required` — plus a sixth, `policy_topic`, present in the actual JSON Schema but not yet reflected in `output-schema.md`'s field table (a small doc/code drift worth fixing).

**Guardrails** (`guardrails.md`): a risk-to-control-layer map that is unusually candid — it explicitly marks most prompt-only controls as "not sufficient alone" rather than claiming the risk is solved. Confirmed open gaps as of the last update: order-ID validation ownership, sensitive-info leakage (later resolved in v0.4), structured-output validation (arguably resolved by `src/classifier.js`'s Ajv check, though not where the doc expected), and response-stage hallucination coverage.

**Evaluation** (`evaluation-set-v1.md`, `tests/evaluation.js`): 15 Round 1 cases (normal, paraphrased, missing-info, unsupported, ambiguous, injection, escalation) — 15/15 pass. `prompt-iterations.md` documents a Round 2 case (TC-21) that failed and was fixed. The evaluation script is real and runnable (`npm test` → `node tests/evaluation.js`), not just a markdown table — though it targets `src/server.js` on port 3000, which, per Section 3, isn't in the live path.

**Response generation** (`response-generator.md`): a separate LLM prompt with its own guardrails and 8 total passing test cases across two rounds, including the highest-risk "order not found" case (verified to neither confirm nor deny the order exists — just reports the lookup outcome). Not currently called by any running code (Section 3.2, Path 3).

**Self-audit** (`audit-notes.md`): the team caught six files that were committed with 0 bytes despite commit messages implying real content, root-caused it to a paste/save step being skipped before `git commit`, and restored them with an honestly-worded fix commit rather than disguising it as a first-time add. This is good practice and worth citing directly as delivery evidence.

**Known limitations, stated honestly** (`limitations.md`): the team's own summary is accurate and doesn't overclaim — it lists exactly what's verified vs. not, including "no end-to-end testing with the actual Zapier workflow." This document's Section 3 above is essentially the detailed version of that one line.

---

## 5. Non-AI Components

**Data** (`data/`): fictional orders (`NS1001`–`NS1010`) and an 11-entry returns/refund policy table, each with a `policy_id`, category, canonical answer, and example phrasings used by `policyService.js`'s keyword matcher. `data/README.md` explicitly confirms the dataset is fictional/test-only.

**Schemas** (`schemas/output-schema.json`): draft-07 JSON Schema, `additionalProperties: false`, enforced via Ajv in `src/classifier.js`. This is real, working validation — not just a spec.

**Server implementations**: two independent Express servers exist (`src/server.js` on :3000, `server/index.js` on :5000) with different purposes and neither is currently the frontend's actual backend (Section 3).

**Frontend** (`frontend/`): React 19 + TypeScript + Vite chat UI, deployed via GitHub Actions to GitHub Pages (`.github/workflows/deploy-pages.yml` builds and publishes `frontend/dist` on every push to `main`). Functionally complete as a chat widget; its support logic (Section 3.2, Path 1) is the simplest of the four implementations in the repo.

**Tests** (`tests/`): `evaluation.js` is a real automated eval runner against a live server. `orderService.test.js`, `policyService.test.js`, and `responseService.test.js` are manual smoke-test scripts — they call functions and `console.log` the output for human inspection, with no assertions or pass/fail logic. They're useful for manual verification but wouldn't fail a CI run even if the underlying logic broke.

---

## 6. Running the Project (as it actually exists today)

There is no single command that runs the full, connected system, because — per Section 3 — the pieces aren't wired together. Individually:

**AI classifier API** (`src/`, the tested reference implementation):

```bash
npm install
cp .env.example .env        # set GEMINI_API_KEY
npm start                   # runs src/server.js on :3000
npm test                    # runs tests/evaluation.js against it
```

**Bridge server** (`server/`):

```bash
cd server
npm install
cp .env.example .env        # set AUTOMATION_WEBHOOK_URL
npm start                   # runs on :5000
```

**Frontend** (`frontend/`) — note this currently talks to n8n directly, not to either server above:

```bash
cd frontend
npm install
npm run dev                 # vite dev server, default :5173
```

To actually connect the frontend to the tested `src/` classifier, `frontend/src/services/supportService.ts` would need to point at `src/server.js`'s `/api/support` endpoint (or at `server/index.js`, per the `VITE_API_BASE_URL` env var that already exists but isn't used) instead of the hardcoded n8n URL.

---

## 7. Gap Analysis / Recommendations for Go-Live Readiness

| #   | Gap                                                                                        | Evidence                                                  | Owner                                                 |
| --- | ------------------------------------------------------------------------------------------ | --------------------------------------------------------- | ----------------------------------------------------- |
| 1   | Live frontend uses a 2-bucket keyword classifier, not the tested 3-intent LLM classifier   | `frontend/src/services/supportService.ts`                 | @mbogo756 + @adeshissack27-arch                       |
| 2   | Three different classification implementations exist with no single source of truth        | Section 3.2                                               | Whole team — needs a decision, not just documentation |
| 3   | `response-generator.md`'s LLM prompt is tested but never called by running code            | No `openai`/response-generator import anywhere in `src/`  | @manmungadr-creator + @adeshissack27-arch             |
| 4   | `Northstar-MVP- ZAP.JSON` is not valid JSON (trailing comment) and can't be re-imported    | File ends with `// ... (rest of your steps)`              | @adeshissack27-arch                                   |
| 5   | `output-schema.md`'s field table doesn't list `policy_topic`, which is in the real schema  | `schemas/output-schema.json` vs. `AI/output-schema.md` §5 | @manmungadr-creator (doc fix, low effort)             |
| 6   | Regression test of the original 15 cases against the current prompt (v0.4) was never rerun | `AI/known-issues.md` #6, `AI/limitations.md`              | @manmungadr-creator                                   |
| 7   | No end-to-end test has been run through any single connected path                          | `AI/limitations.md` (self-reported)                       | @adeshissack27-arch                                   |

None of these are AI-design problems — the classification prompt, schema, and guardrails are the most solid part of the repo. They're integration and single-source-of-truth problems, and they're exactly what a Go-Live Readiness Note exists to surface honestly rather than paper over.

---

## 8. Outstanding Work, by Owner

### @adeshissack27-arch — Automation & Testing

- **Decide the canonical automation platform.** n8n is what's actually live (Path 1); a separate, disconnected Zapier export exists (Path 2). Both can't be "the" automation layer — pick one and retire the other, or document clearly why both exist.
- **Fix `Northstar-MVP- ZAP.JSON`** — it currently ends mid-file with `// ... (rest of your steps)`, which is not valid JSON and can't be re-imported into Zapier as-is.
- **Run one genuine end-to-end test** through a single connected path (frontend → automation → AI → data → response). Per `AI/limitations.md`, this has never happened on any of the four paths in Section 3.
- **Implement the schema validation step** `AI/schema-validation-spec.md` asks the automation layer to build (`known-issues.md` #3) — or confirm that `src/classifier.js`'s existing Ajv validation is meant to serve this role, and update the docs to say so instead of listing it as open.
- **Turn the three `tests/*.test.js` files into real tests.** They currently `console.log` output for manual inspection with no assertions — they'd pass even if the underlying logic broke.

### @manmungadr-creator — AI & Backend

- **Wire `src/responseService.js` to the tested `response-generator.md` LLM prompt**, or formally retire that prompt in favor of the template approach and say so in `AI/limitations.md`. Right now the tested prompt (8/8 passing across two rounds) and the code that actually runs are two different implementations of the same job.
- **Rerun the original 15 classifier cases against prompt v0.4.** Flagged twice already (`known-issues.md` #6) and deferred both times — the prompt has changed three times since those 15 were last verified in full.
- **Fix the `output-schema.md` field table** to include `policy_topic`, which is already required in `schemas/output-schema.json` and used throughout `classification-prompt.md`'s examples.
- **Close the data-context contract gap** (`output-schema.md` §8) — this needs Data's input on the real lookup output shape, so coordinate with @odhiamboakinyivallarie.
- **Decide whether `src/server.js` becomes the real backend.** It's the most complete, tested implementation of the documented design, but nothing currently calls it.

### @mbogo756 — Frontend

- **Stop calling the n8n webhook directly with a local keyword classifier.** Point `supportService.ts` at a tested backend instead — either `src/server.js`'s `/api/support` endpoint or `server/index.js` (the `VITE_API_BASE_URL` env var already exists in `frontend/.env.example` for exactly this, but isn't used yet).
- **Add a real `UNKNOWN_UNSUPPORTED` / escalation path in the UI.** The current `detectType()` only distinguishes `order` vs. `return` — there's no third bucket, so unsupported requests are currently always treated as order queries.
- **Confirm the relationship with `server/index.js`** with @adeshissack27-arch — it looks purpose-built for the frontend to call, but currently isn't.

### @odhiamboakinyivallarie — Data

- **Confirm `order_id` validation ownership** with AI & Backend (`known-issues.md` #1, #7) — nothing currently confirms whether Data, Automation, or the AI layer owns checking that an extracted order ID actually exists.
- **Confirm whether `order_id` is genuinely required for `RETURNS_REFUNDS` lookups.** This is currently an unconfirmed assumption baked into the classifier and the 15-case evaluation set (`evaluation-set-v1.md` caveats).
- **Help define the data-context contract** — the shape of the object passed into response generation (order fields, policy text) — since Data owns the source format this contract needs to describe.
- The order and policy datasets themselves (`data/orders.json`, `data/returns-policy.json`) are consistent, well-formed, and confirmed fictional — no issues found there.

### @tiisetsokutu44-hub — Documentation Owner

- **Fold the architecture findings in Section 3 of this document into the official Day 5 Go-Live Readiness Note** — `AI/limitations.md` already flags "no end-to-end testing," but doesn't spell out _why_ (four disconnected implementations), which this document does.
- **Get one team decision recorded** on which automation path is canonical, then update the root `README.md`'s MVP Workflow diagram to reflect what's actually built vs. what's still aspirational — right now the diagram implies one connected pipeline, which isn't the current state.
- **Add a Contributors section to the root `README.md`** crediting each role — it's currently absent there even though the sprint's Definition of Done asks for work to be "traceable to the contributor's work."
