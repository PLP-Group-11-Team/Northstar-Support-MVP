require("dotenv").config();

const express = require("express");
const { classifyIntent } = require("./classifier");

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "northstar-ai-classifier"
  });
});

app.post("/api/classify", async (req, res) => {
  try {
    const { customer_message } = req.body;

    if (
      !customer_message ||
      typeof customer_message !== "string"
    ) {
      return res.status(400).json({
        error: "customer_message is required"
      });
    }

    const result = await classifyIntent(customer_message);

    return res.status(200).json(result);

  } catch (error) {
    console.error("Classification error:", error);

    // Gemini/API quota or rate-limit error
    if (
      error.statusCode === 429 ||
      error.code === "too_many_requests"
    ) {
      return res.status(429).json({
        error: "AI provider quota exceeded",
        retryable: true
      });
    }

    // Other AI/API errors
    return res.status(500).json({
      error: "AI classification failed",
      retryable: false
    });
  }
});

app.listen(PORT, () => {
  console.log(
    `Northstar AI API running on http://localhost:${PORT}`
  );
});