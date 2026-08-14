# AI Requirements

## 1. AI Component Purpose

The AI component provides language understanding and natural-language generation capabilities for the Northstar Retail Support Deflection MVP.

Its primary functions are to:

* Understand the customer's support request.
* Classify the request into a supported or unsupported intent.
* Extract relevant information explicitly provided by the customer, such as an order ID.
* Identify when information required for the next workflow step is missing.
* Generate customer-facing responses using only factual information supplied by the workflow or approved knowledge source.
* Produce predictable output that can be consumed by the automation layer.

The AI operates as part of the workflow between the customer-facing interface, automation layer, and the data/knowledge layer. The exact invocation pattern and integration contract will be finalized with the Automation team.

The AI is responsible for language understanding and generation. It is **not the source of truth for factual business data or business rules**.

---

## 2. AI Scope

### 2.1 In Scope

The AI component must support:

* Customer intent classification.
* Extraction of information explicitly stated in customer messages.
* Detection of missing information required for the next workflow step.
* Identification of unsupported or ambiguous requests.
* Natural-language response generation based on information supplied by the workflow/data layer.
* Structured output suitable for consumption by automation layer.
* AI-level guardrails against hallucination, prompt injection, unsupported claims, and scope violations.
* AI evaluation and prompt iteration.

### 2.2 Out of Scope

The AI component is not responsible for:

* Looking up, storing, or maintaining customer or order data.
* Determining whether an order ID actually exists.
* Determining the factual status of an order.
* Determining actual delivery dates or tracking information.
* Determining refund eligibility or refund amounts.
* Creating or modifying business policies.
* Making or overriding business-rule decisions.
* Executing workflow actions.
* Managing application state.
* Implementing frontend behavior.
* Implementing the workflow orchestration.
* Designing or maintaining the database/data layer.
* Deployment.
* Overall system QA.
* Implementing the human-support escalation mechanism.
* Handling Stock Availability as a supported MVP intent.

---

## 3. Supported Intent Taxonomy

The initial MVP uses the smallest viable intent taxonomy:

1. `ORDER_STATUS`
2. `RETURNS_REFUNDS`
3. `UNKNOWN_UNSUPPORTED`

No additional intent should be introduced unless a demonstrated MVP requirement justifies the added complexity.

### 3.1 `ORDER_STATUS`

**Definition**

The customer is asking about the status, progress, location, shipment, or expected delivery of an existing order.

**Qualifies**

Examples include:

* "Where is my order?"
* "Has my order shipped?"
* "When should my package arrive?"
* "What is the status of order NS1042?"
* "Can you tell me where my package is?"

A missing order ID does **not** make the request unsupported. If the intent is clear but the order ID is missing, the AI should classify the intent as `ORDER_STATUS` and indicate that the required information is missing.

**Does not qualify**

Requests primarily concerning:

* Returning an item.
* Obtaining a refund.
* Stock availability.
* Unrelated account or support issues.

### 3.2 `RETURNS_REFUNDS`

**Definition**

The customer is asking about returning a product, obtaining a refund, or understanding the returns/refund process.

**Qualifies**

Examples include:

* "Can I return this item?"
* "I want to return my order."
* "How do I get a refund?"
* "When will my refund arrive?"
* "What is your return policy?"

A missing order ID or other identifying information does **not** make the request unsupported if the customer's intent is clearly about returns or refunds.

**Does not qualify**

Requests primarily concerning:

* Order delivery or shipment status.
* Stock availability.
* Unrelated account or support issues.

### 3.3 `UNKNOWN_UNSUPPORTED`

**Definition**

The customer request does not clearly match either supported MVP intent, is explicitly outside the MVP scope, or is too ambiguous to classify safely.

**Qualifies**

Examples include:

* "Do you have this in blue?"
* "Is this product available in size 10?"
* "Can I change my password?"
* "Help me with my account."
* A request containing insufficient context to determine the customer's intent.

Stock Availability must be classified as `UNKNOWN_UNSUPPORTED` because it is explicitly outside the MVP scope.

**Does not qualify**

A request should not be classified as `UNKNOWN_UNSUPPORTED` merely because required information is missing.

For example:

> "Where is my order?"

should remain `ORDER_STATUS` even though an order ID is not provided.

---

## 4. AI Responsibilities

The AI/Prompt Engineering component is responsible for:

* Defining and maintaining the AI intent taxonomy.
* Designing and iterating the intent-classification prompt.
* Defining classification behavior and decision boundaries.
* Extracting information explicitly present in customer input.
* Identifying missing information relevant to the next workflow step.
* Designing and iterating the response-generation prompt.
* Defining the AI output requirements in collaboration with the Automation team.
* Designing AI-level guardrails.
* Defining AI-level failure and escalation signals.
* Creating and maintaining the AI evaluation dataset.
* Evaluating AI behavior against defined test cases.
* Analyzing classification and response failures.
* Improving prompts based on evaluation evidence.
* Documenting AI decisions, limitations, and prompt iterations.
* Providing GitHub evidence of AI contribution.

---

## 5. AI Non-Responsibilities

The AI must not:

* Invent or infer factual order information that has not been supplied by the workflow/data layer.
* Assert an order status that has not been confirmed by the data layer.
* Invent delivery dates, tracking information, or shipment events.
* Determine whether an order ID exists.
* Treat an order ID as valid merely because it has a plausible format.
* Determine refund eligibility independently.
* Invent refund amounts, timelines, or policy terms.
* Override or reinterpret authoritative business rules.
* Invent missing business information.
* Execute transactions or workflow actions.
* Modify customer or order records.
* Maintain authoritative application state.
* Determine how automation layer performs routing or data retrieval.
* Implement the actual human-escalation mechanism.
* Treat unsupported requests as supported merely to provide an answer.

The AI may **signal** that clarification or human escalation is required, but the workflow or human-support process is responsible for executing the resulting action.

---

## 6. AI Input Requirements

### 6.1 Required Input

At minimum, the AI requires:

* The customer's raw query text.

### 6.2 Information Potentially Required

Depending on the final workflow design, the AI may also receive:

* Relevant conversation context.
* Structured metadata.
* Extracted entities such as an order ID.
* Retrieved order information.
* Relevant returns/refund policy information.
* Workflow status or lookup results.
* Escalation context.

The exact fields, formats, and invocation pattern must be confirmed with the Automation team before the final interface is implemented.

### 6.3 Data Dependency

The Data/Knowledge Base team must provide realistic examples of:

* Test orders.
* Order identifiers and their format.
* Relevant order fields.
* Returns/refund policy information.

These are required to ensure that AI prompts and evaluation cases are based on realistic MVP data rather than invented assumptions.

---

## 7. AI Output Requirements

The AI output must provide sufficient information for automation layer to determine the appropriate next workflow action.

At minimum, the output must allow the workflow to determine:

* Classified intent.
* Relevant information extracted from the customer request, where applicable.
* Whether required information is missing.
* Whether clarification is required.
* Whether the request is unsupported.
* Whether human escalation should be signaled.

The exact field-level JSON schema is intentionally deferred to the dedicated output-contract/schema task.

The schema must be:

* Predictable.
* Machine-readable.
* Minimal.
* Explicit about unknown or missing values.
* Consistent across supported and unsupported requests.

The AI must not return factual business information as though it were authoritative unless that information was supplied by the workflow or approved knowledge source.

---

## 8. AI / Workflow Boundary

The following responsibilities establish the initial system boundary:

| Decision or Action                                      | Primary Owner               |
| ------------------------------------------------------- | --------------------------- |
| Understand the customer's natural-language request      | AI                          |
| Classify customer intent                                | AI                          |
| Extract information explicitly stated by the customer   | AI                          |
| Identify missing information                            | AI                          |
| Determine whether an order ID actually exists           | Data / Workflow             |
| Retrieve order information                              | Data / Workflow             |
| Determine actual order status                           | Data / Workflow             |
| Determine actual delivery information                   | Data / Workflow             |
| Provide authoritative returns/refund policy information | Data / Policy Source        |
| Apply deterministic business rules                      | Workflow / Business Rules   |
| Explain supplied factual information to the customer    | AI                          |
| Route requests between workflow steps                   | Workflow              |
| Perform data lookups                                    | Data Layer            |
| Execute transactions or record changes                  | Workflow / Application      |
| Signal that human escalation may be required            | AI                          |
| Execute the human handoff                               | Human Support Process |

### Core Principle

The AI is **not the source of truth** for factual or business-rule information.

The AI interprets customer language and communicates information supplied by authoritative system components.

---

## 9. Failure and Escalation Requirements

### 9.1 Unknown Intent

If a request does not match a supported intent:

* Classify it as `UNKNOWN_UNSUPPORTED`.
* Do not force it into a supported intent.
* Do not fabricate an answer.
* Signal the appropriate downstream behavior.

### 9.2 Missing Information

If the intent is clear but required information is missing:

* Preserve the correct intent.
* Identify the missing information.
* Do not guess the missing value.
* Allow the workflow to request the required information.

Example:

> "Where is my order?"

Expected interpretation:

```text
intent = ORDER_STATUS
order_id = missing
```

The exact output representation will be defined later.

### 9.3 Invalid Information

The AI must not independently determine whether information such as an order ID is valid.

If the workflow/data layer reports that an order cannot be found, the AI may explain that result to the customer using only the information supplied by the workflow.

The AI must not speculate about the reason.

### 9.4 Ambiguous Requests

If the customer's intent cannot be determined confidently:

* Do not guess.
* Request clarification where the workflow supports clarification.
* Otherwise classify as `UNKNOWN_UNSUPPORTED`.

### 9.5 Unsupported Requests

Explicitly unsupported requests, including Stock Availability, must not be answered as though they are supported MVP capabilities.

### 9.6 Unsafe or Unsupported Response

If the AI cannot generate a response without making an unsupported factual or business-rule claim:

* Do not fabricate the information.
* Signal that the case requires clarification or escalation.
* Allow the downstream workflow to determine the appropriate action.

The exact human-escalation mechanism remains a dependency to be confirmed with the Automation and Project/Documentation teams.

---

## 10. Initial AI Quality Requirements

The following are **acceptance requirements to be validated through testing**, not claims that the current implementation already satisfies them.

The AI should:

* Correctly classify clear `ORDER_STATUS` requests.
* Correctly classify clear `RETURNS_REFUNDS` requests.
* Correctly classify unsupported requests as `UNKNOWN_UNSUPPORTED`.
* Preserve the correct intent when required information is missing.
* Detect missing information without inventing values.
* Produce predictable structured output.
* Avoid fabricating order information.
* Avoid fabricating delivery information.
* Avoid fabricating returns/refund policy information.
* Avoid following user instructions that attempt to override system constraints.
* Behave consistently across reasonable paraphrases.
* Handle ambiguous requests without making unsupported assumptions.
* Signal escalation or clarification when it cannot safely proceed.

Performance against these requirements must be established through the AI evaluation process.

---

## 11. Dependencies

### 11.1 Data / Knowledge Base Team

**Required:**

* Sample test orders.
* Order field structure.
* Order identifier format.
* Returns/refund policy information.
* Expected examples of valid and invalid lookup results.

**Why:**

These inputs are required to create realistic prompts, response behavior, guardrails, and evaluation cases.

**AI work dependent on this:**

* Response-generation design.
* Data-grounding rules.
* Guardrail testing.
* Evaluation dataset.

### 11.2 Automation Team

**Required:**

* Actual AI invocation pattern.
* Input format supplied to the AI.
* Output information required by downstream workflow steps.
* How retrieved data will be passed to the AI.
* How clarification and escalation signals will be consumed.

**Why:**

These requirements determine the final AI-to-Automation_layer contract and structured output schema.

**AI work dependent on this:**

* Final input contract.
* Final output schema.
* Integration specification.
* End-to-end integration testing.

### 11.3 Project / Documentation Team

**Required:**

* Confirmation of the expected human-escalation process.
* Any project-level documentation requirements affecting AI evidence.

**AI work dependent on this:**

* Final escalation documentation.
* Final contribution evidence.
* Go-Live Readiness documentation.

---

## 12. Initial Definition of Done

This requirements document is complete when:

* [ ] The purpose of the AI component is clearly defined.
* [ ] AI scope and non-scope are explicitly defined.
* [ ] `ORDER_STATUS` is clearly defined.
* [ ] `RETURNS_REFUNDS` is clearly defined.
* [ ] `UNKNOWN_UNSUPPORTED` is clearly defined.
* [ ] Missing information is distinguished from unsupported intent.
* [ ] AI responsibilities are separated from data, workflow, business-rule, and human-support responsibilities.
* [ ] AI input requirements are documented without inventing unconfirmed fields.
* [ ] AI output requirements are defined at the capability level without prematurely locking the JSON schema.
* [ ] Failure and escalation behavior is defined at the AI level.
* [ ] External dependencies are explicitly identified.
* [ ] Requirements are stated in terms that can be tested later.
* [ ] No unnecessary intents, APIs, database fields, or business rules have been introduced.
* [ ] The document is suitable as the baseline for subsequent prompt, schema, evaluation, and integration tasks.
