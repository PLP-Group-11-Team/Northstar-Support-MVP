const { generateResponse } = require("../src/responseService");

console.log("Testing unsupported request:");

console.log(
  generateResponse({
    intent: "UNKNOWN_UNSUPPORTED"
  })
);

console.log("\nTesting missing order ID:");

console.log(
  generateResponse({
    intent: "ORDER_STATUS",
    next_action: "REQUEST_ORDER_ID"
  })
);

console.log("\nTesting order not found:");

console.log(
  generateResponse({
    intent: "ORDER_STATUS",
    next_action: "ORDER_NOT_FOUND"
  })
);

console.log("\nTesting order status:");

console.log(
  generateResponse({
    intent: "ORDER_STATUS",
    order: {
      order_id: "NS1004",
      product: "Smart Watch",
      status: "Shipped",
      tracking_number: "TRK83952",
      expected_delivery: "2026-08-14",
      last_update: "Package arrived at Nairobi distribution center"
    }
  })
);

console.log("\nTesting policy response:");

console.log(
  generateResponse({
    intent: "RETURNS_REFUNDS",
    policy: {
      policy_id: "REFUND_TIMING",
      answer:
        "After the returned item is received and approved, the refund is initiated within 3-5 business days."
    }
  })
);