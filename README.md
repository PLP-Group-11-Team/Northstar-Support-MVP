# Northstar-Support-MVP
AI-powered Support Deflection MVP for Order Status and Returns &amp; Refunds.
# Northstar Retail Support Deflection MVP

A 5-day industry-style MVP for reducing repetitive customer-support requests for **Northstar Retail Co.**, a simulated e-commerce company.

## Project Overview

Northstar Retail receives repetitive customer-support requests. For this MVP, the team is focusing on two support categories:

* **Order Status**
* **Returns & Refunds**

**Stock Availability is out of scope for this MVP.**

The objective is to build a small, reliable, and demonstrable support-deflection system using test data and clearly defined business rules within a 5-day sprint.

## MVP Workflow

```text
Customer
   ↓
Frontend / Chatbot
   ↓
n8n / Automation
   ↓
AI Intent Classification
   ↓
Relevant Test Data / Knowledge Base
   ↓
AI Response Generation
   ↓
Customer
```

The implementation may change if the team identifies a simpler and more reliable approach that remains realistic within the sprint.

## MVP Scope

### Supported Categories

#### Order Status

Handles customer requests concerning the status of an existing order.

Examples:

* "Where is my order?"
* "Can you check my order?"
* "What's the status of order NS1001?"

#### Returns & Refunds

Handles customer requests concerning product returns and refunds.

Examples:

* "Can I return this item?"
* "How do I request a refund?"
* "What is the return process?"

### Unsupported Requests

Requests outside the MVP scope should not be incorrectly classified as supported requests.

Examples include:

* Stock availability
* Unrelated customer-support requests
* Unsupported account requests
* Requests that cannot be confidently classified

These should be handled through the system's unknown/unsupported or escalation behavior.

## System Components

| Component                   | Responsibility                                                                                 |
| --------------------------- | ---------------------------------------------------------------------------------------------- |
| **Frontend / Chatbot**      | Provides the customer-facing interface and submits customer queries                            |
| **n8n / Automation**        | Connects the frontend, AI, data, and response components                                       |
| **AI / Prompt Engineering** | Handles intent classification, response behavior, guardrails, evaluation, and prompt iteration |
| **Data / Knowledge Base**   | Provides realistic test orders and returns/refund information                                  |
| **QA / Integration**        | Tests the complete system and identifies integration issues                                    |
| **Project / Documentation** | Maintains project-level documentation and sprint evidence                                      |

Each contributor should primarily work within their assigned responsibility while coordinating with other contributors when dependencies exist.

## Repository Structure

The repository structure will evolve as development progresses.

```text
.
├── README.md
│
├── ai/
│   ├── requirements.md
│   ├── intents.md
│   │
│   ├── prompts/
│   │   ├── intent-classifier.md
│   │   ├── response-generator.md
│   │   └── guardrails.md
│   │
│   ├── schemas/
│   │   └── classification-output.json
│   │
│   ├── test-cases/
│   │   └── evaluation-set.json
│   │
│   └── evaluation/
│       ├── test-results.md
│       └── prompt-iterations.md
│
└── ...
```

Files and directories should only be added when they have a clear purpose.

## AI Component

The AI/Prompt Engineering component is responsible for:

* Defining AI requirements
* Defining the intent taxonomy
* Designing intent classification
* Designing classification prompts
* Designing structured AI outputs
* Designing response-generation behavior
* Designing AI guardrails
* Defining failure and escalation behavior
* Creating AI test cases
* Evaluating AI performance
* Analyzing AI failures
* Improving prompts based on evidence
* Documenting AI decisions and limitations
* Defining the AI-to-n8n interface
* Supporting AI integration with n8n

### AI and Workflow Boundary

The AI should not replace deterministic workflow or data logic.

For example:

> The AI may identify that a customer is asking about an order.

However:

> The AI must not invent the customer's order status.

Actual order information must be supplied by the appropriate data/workflow layer.

Similarly, the AI must not:

* Invent delivery dates
* Fabricate refund policies
* Override business rules
* Approve refunds unless explicitly supported by the system
* Invent database information
* Make unsupported claims

## Intent Taxonomy

The initial MVP taxonomy is intentionally small:

| Intent                | Description                                                      |
| --------------------- | ---------------------------------------------------------------- |
| `ORDER_STATUS`        | Customer is asking about an existing order                       |
| `RETURNS_REFUNDS`     | Customer is asking about returning an item or receiving a refund |
| `UNKNOWN_UNSUPPORTED` | Request does not clearly belong to a supported MVP category      |

Additional intents should only be introduced when a clear MVP requirement justifies the added complexity.

## AI Guardrails

The AI component should account for risks including:

* Hallucinated order information
* Fabricated refund policies
* Fabricated delivery dates
* Unsupported claims
* Missing order information
* Invalid order IDs
* Unsupported intents
* Prompt injection
* Malicious user instructions
* Sensitive information leakage
* Incorrect structured output
* Ambiguous requests

Not every risk should be solved through prompting alone. Where appropriate, controls should be implemented at the prompt, workflow, data, or human-escalation level.

## Evaluation

AI behavior will be evaluated using test cases covering:

* Normal queries
* Paraphrased queries
* Ambiguous queries
* Missing information
* Invalid information
* Multi-intent queries
* Unsupported requests
* Adversarial inputs
* Prompt injection attempts
* Escalation scenarios

Each evaluation should track:

| Field                 | Description                          |
| --------------------- | ------------------------------------ |
| **Test ID**           | Unique test identifier               |
| **Input**             | Customer query                       |
| **Expected Intent**   | Expected classification              |
| **Actual Intent**     | Model classification                 |
| **Expected Behavior** | Required system behavior             |
| **Actual Behavior**   | Observed behavior                    |
| **Pass/Fail**         | Evaluation result                    |
| **Failure Reason**    | Explanation when a test fails        |
| **Prompt Version**    | Prompt used during testing           |
| **Improvement Made**  | Change resulting from the evaluation |

AI reliability should be demonstrated through test evidence rather than assumed from the quality of a prompt.

## Prompt Iteration

Prompt improvements should follow an evidence-based process:

```text
Prompt V1
   ↓
Test
   ↓
Identify Failure
   ↓
Determine Cause
   ↓
Modify Prompt
   ↓
Test Again
   ↓
Compare Results
   ↓
Select Better Version
```

Every significant prompt change should document:

* What changed
* Why it changed
* Which failure motivated the change
* Whether performance improved
* Whether new problems were introduced

## Development Workflow

Contributors should generally follow:

```text
Task
  ↓
Feature Branch
  ↓
Implementation
  ↓
Commit
  ↓
Push
  ↓
Pull Request
  ↓
Review
  ↓
Merge
```

### Branch Naming

Branches should represent specific pieces of work rather than permanent team roles.

Examples:

```text
feature/ai-requirements
feature/ai-intent-classifier
feature/ai-evaluation
feature/n8n-workflow
feature/frontend-chat
feature/test-data
```

### Commit Convention

Use:

```text
<type>: <what changed> - <why it matters>
```

Examples:

```text
docs: define AI requirements - establishes MVP AI scope
feat: add intent classifier - routes customer queries correctly
test: add ambiguous queries - evaluates classification reliability
fix: handle unknown intents - prevents unsupported responses
docs: document AI guardrails - defines safe response boundaries
```

Commits should represent genuine project work.

## Five-Day Sprint

### Day 1 — AI Requirements & Design

Focus on:

* AI responsibility definition
* Intent taxonomy
* AI input specification
* AI output specification
* Classification design
* Response-generation design
* Guardrail requirements
* Failure behavior
* Initial test dataset
* AI documentation

### Day 2 — AI Implementation

Focus on:

* Classification prompt
* Structured output
* Order Status classification
* Returns & Refunds classification
* Unknown-intent handling
* Response generation
* Initial AI testing
* Failure identification

### Day 3 — Evaluation & Integration

Focus on:

* Expanded test coverage
* Edge cases
* Guardrail testing
* Prompt improvement
* AI-to-n8n interface
* n8n integration
* End-to-end testing
* Known limitations

### Day 4 — Audit & Correction

Focus on:

* AI commits
* Prompt versions
* Test results
* Documentation
* Pull requests
* Integration evidence
* Failed test cases
* Scope creep
* Corrections

### Day 5 — Final AI Delivery

Focus on:

* Final MVP prompts
* Final schemas
* Final test results
* Guardrail documentation
* AI limitations
* Integration documentation
* GitHub contribution evidence
* AI section of the Go-Live Readiness Note
* Final AI demonstration

## Prioritization

Work should be prioritized using:

| Priority | Meaning                   |
| -------- | ------------------------- |
| **P0**   | Required for MVP          |
| **P1**   | Important for reliability |
| **P2**   | Useful improvement        |
| **P3**   | Nice-to-have              |

P2 and P3 work should not take priority while required P0 work remains incomplete.

## Definition of Done

A deliverable is not considered complete merely because a file exists.

Completion should be based on defined acceptance criteria and evidence.

For AI work, this means the relevant component should be:

* Clearly defined
* Implemented where required
* Tested
* Evaluated
* Documented
* Integrated where applicable
* Committed to GitHub
* Traceable to the contributor's work

## Project Goal

Deliver a technically defensible 5-day MVP that demonstrates how AI can safely and reliably help deflect repetitive Northstar Retail customer-support requests for:

1. Order Status
2. Returns & Refunds

while clearly identifying:

* Supported and unsupported requests
* AI responsibilities
* Workflow responsibilities
* Failure cases
* Guardrails
* Evaluation results
* Known limitations
* Individual team contributions

