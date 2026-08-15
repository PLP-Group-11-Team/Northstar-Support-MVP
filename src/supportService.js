const { classifyIntent } = require("./classifier");
const { getOrderById } = require("./orderService");

async function handleSupportRequest(customerMessage) {
  const classification = await classifyIntent(customerMessage);

  const result = {
    intent: classification.intent,
    order_id: classification.order_id || null,
    missing_information: classification.missing_information || [],
    clarification_required: classification.clarification_required || false,
    escalation_required: classification.escalation_required || false
  };

  // Unsupported request
  if (classification.intent === "UNKNOWN_UNSUPPORTED") {
    return result;
  }

  // Returns/refunds will be handled after the policy layer is built
  if (classification.intent === "RETURNS_REFUNDS") {
    return {
      ...result,
      next_action: "POLICY_LOOKUP"
    };
  }

  // Order status request with no order ID
  if (
    classification.intent === "ORDER_STATUS" &&
    !classification.order_id
  ) {
    return {
      ...result,
      clarification_required: true,
      next_action: "REQUEST_ORDER_ID"
    };
  }

  // Order status request with an order ID
  if (
    classification.intent === "ORDER_STATUS" &&
    classification.order_id
  ) {
    const order = getOrderById(classification.order_id);

    if (!order) {
      return {
        ...result,
        next_action: "ORDER_NOT_FOUND"
      };
    }

    return {
      ...result,
      order,
      next_action: "GENERATE_RESPONSE"
    };
  }

  return {
    ...result,
    escalation_required: true,
    next_action: "ESCALATE"
  };
}

module.exports = {
  handleSupportRequest
};