const {
  getPolicyById,
  getPoliciesByCategory,
  findPolicyByKeywords
} = require("../src/policyService");

console.log("Testing REFUND_TIMING:");

const refundPolicy = getPolicyById("REFUND_TIMING");

console.log(refundPolicy);

console.log("\nTesting Returns policies:");

const returnPolicies = getPoliciesByCategory("Returns");

console.log(`Found ${returnPolicies.length} Returns policies.`);

console.log("\nTesting policy matching:");

const policy = findPolicyByKeywords(
  "How long will my refund take?"
);

console.log(policy);

console.log("\nTesting unknown policy:");

const unknown = findPolicyByKeywords(
  "What is your store opening time?"
);

console.log(unknown);