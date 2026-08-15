const fs = require("fs");
const path = require("path");

const policyPath = path.join(
  __dirname,
  "..",
  "data",
  "returns-policy.json"
);

function getPolicies() {
  const file = fs.readFileSync(policyPath, "utf8");
  return JSON.parse(file);
}

function getPolicyById(policyId) {
  const policies = getPolicies();

  return (
    policies.find(
      (policy) =>
        policy.policy_id.toLowerCase() === policyId.toLowerCase()
    ) || null
  );
}

function getPoliciesByCategory(category) {
  const policies = getPolicies();

  return policies.filter(
    (policy) =>
      policy.category.toLowerCase() === category.toLowerCase()
  );
}

function findPolicyByKeywords(message) {
  const policies = getPolicies();

  const text = message.toLowerCase();

  const matches = policies
    .map((policy) => {
      let score = 0;

      const searchableText = [
        policy.topic,
        policy.answer,
        ...policy.examples
      ]
        .join(" ")
        .toLowerCase();

      const words = text
        .replace(/[^\w\s-]/g, "")
        .split(/\s+/)
        .filter(Boolean);

      for (const word of words) {
        if (word.length > 2 && searchableText.includes(word)) {
          score++;
        }
      }

      return {
        policy,
        score
      };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  return matches.length > 0 ? matches[0].policy : null;
}

module.exports = {
  getPolicyById,
  getPoliciesByCategory,
  findPolicyByKeywords
};