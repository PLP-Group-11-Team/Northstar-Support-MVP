const { classifyIntent } = require("./classifier");
const { getOrderById } = require("./orderService");
const { findPolicyByKeywords } = require("./policyService");
const { generateResponse } = require("./responseService");

async function handleSupportRequest(customerMessage) {
  const classification = await classifyIntent(customerMessage);

  const result = {
    intent: classification.intent,
    order_id: classification.order_id || null,
    missing_information: classification.missing_information || [],
    clarification_required:
      classification.clarification_required || false,
    escalation_required:
      classification.escalation_required || false
  };

  // ----------------------------------------
  // 1. Unsupported request
  // ----------------------------------------
  if (classification.intent === "UNKNOWN_UNSUPPORTED") {
    return generateResponse(result);
  }

  // ----------------------------------------
  // 2. Returns / Refunds
  // ----------------------------------------
  if (classification.intent === "RETURNS_REFUNDS") {
    const policy = findPolicyByKeywords(customerMessage);

    if (!policy) {
      return generateResponse({
        ...result,
        escalation_required: true,
        next_action: "ESCALATE"
      });
    }

    return generateResponse({
      ...result,
      policy_topic: policy.policy_id,
      policy,
      next_action: "GENERATE_RESPONSE"
    });
  }

  // ----------------------------------------
  // 3. Order status without order ID
  // ----------------------------------------
  if (
    classification.intent === "ORDER_STATUS" &&
    !classification.order_id
  ) {
    return generateResponse({
      ...result,
      clarification_required: true,
      next_action: "REQUEST_ORDER_ID"
    });
  }

  // ----------------------------------------
  // 4. Order status with order ID
  // ----------------------------------------
  if (
    classification.intent === "ORDER_STATUS" &&
    classification.order_id
  ) {
    const order = getOrderById(classification.order_id);

    // Order does not exist
    if (!order) {
      return generateResponse({
        ...result,
        next_action: "ORDER_NOT_FOUND"
      });
    }

    // Order found
    return generateResponse({
      ...result,
      order,
      next_action: "GENERATE_RESPONSE"
    });
  }

  // ----------------------------------------
  // 5. Safety fallback
  // ----------------------------------------
  return generateResponse({
    ...result,
    escalation_required: true,
    next_action: "ESCALATE"
  });
}

module.exports = {
  handleSupportRequest
};