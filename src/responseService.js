function generateResponse(result) {
  if (!result || !result.intent) {
    throw new Error("Invalid support result");
  }

  // Common fields returned by the support API.
  // Internal order/policy objects are deliberately not exposed.
  const baseResponse = {
    intent: result.intent,
    order_id: result.order_id || null,
    escalation_required: Boolean(result.escalation_required)
  };

  // --------------------------------------------------
  // 1. Unsupported request
  // --------------------------------------------------
  if (result.intent === "UNKNOWN_UNSUPPORTED") {
    return {
      ...baseResponse,
      response:
        "I'm sorry, but I can't help with that request through the current support service.",
      next_action: "SEND_RESPONSE"
    };
  }

  // --------------------------------------------------
  // 2. Order status - missing order ID
  // --------------------------------------------------
  if (
    result.intent === "ORDER_STATUS" &&
    result.next_action === "REQUEST_ORDER_ID"
  ) {
    return {
      ...baseResponse,
      response:
        "Please provide your order ID so I can check the status of your order.",
      next_action: "SEND_RESPONSE"
    };
  }

  // --------------------------------------------------
  // 3. Order status - order not found
  // --------------------------------------------------
  if (
    result.intent === "ORDER_STATUS" &&
    result.next_action === "ORDER_NOT_FOUND"
  ) {
    return {
      ...baseResponse,
      response:
        "I couldn't find an order matching the order ID you provided. Please check the order ID and try again.",
      next_action: "SEND_RESPONSE"
    };
  }

  // --------------------------------------------------
  // 4. Order status - order found
  // --------------------------------------------------
  if (
    result.intent === "ORDER_STATUS" &&
    result.order
  ) {
    const order = result.order;

    let response =
      `Your order ${order.order_id} for ${order.product} is currently ${String(
        order.status
      ).toLowerCase()}.`;

    // Only include tracking information when it actually exists.
    if (
      order.tracking_number &&
      order.tracking_number !== "—" &&
      order.tracking_number !== "â€”" &&
      order.tracking_number !== "-"
    ) {
      response += ` The tracking number is ${order.tracking_number}.`;
    }

    // Include delivery information supplied by the data layer.
    if (order.expected_delivery) {
      response += ` The expected delivery date is ${order.expected_delivery}.`;
    }

    // Include the latest factual update supplied by the data layer.
    if (order.last_update) {
      response += ` Latest update: ${order.last_update}.`;
    }

    return {
      ...baseResponse,
      response,
      next_action: "SEND_RESPONSE"
    };
  }

  // --------------------------------------------------
  // 5. Returns / refunds - policy found
  // --------------------------------------------------
  if (
    result.intent === "RETURNS_REFUNDS" &&
    result.policy
  ) {
    return {
      ...baseResponse,
      response: result.policy.answer,
      next_action: "SEND_RESPONSE"
    };
  }

  // --------------------------------------------------
  // 6. Safety fallback
  // --------------------------------------------------
  return {
    ...baseResponse,
    response:
      "I'm unable to safely generate a response for this request. Please try again or contact support.",
    next_action: "ESCALATE",
    escalation_required: true
  };
}

module.exports = {
  generateResponse
};