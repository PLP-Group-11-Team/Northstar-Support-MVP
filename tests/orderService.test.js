const { getOrderById } = require("../src/orderService");

console.log("Testing existing order: NS1004");

const existingOrder = getOrderById("NS1004");

console.log(existingOrder);

console.log("\nTesting missing order: NS9999");

const missingOrder = getOrderById("NS9999");

console.log(missingOrder);