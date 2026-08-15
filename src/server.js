require("dotenv").config();

const express = require("express");
const { classifyIntent } = require("./classifier");
const { getOrderById } = require("./orderService");
const { handleSupportRequest } = require("./supportService");

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;

// API landing endpoint
app.get("/", (req, res) => {
  res.json({
    service: "Northstar Retail Support AI API",
    status: "running",
    endpoints: {
      health: "GET /health",
      classify: "POST /api/classify"
    }
  });
});

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "northstar-ai-classifier"
  });
});

// AI classification
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

    if (
      error.statusCode === 429 ||
      error.code === "too_many_requests"
    ) {
      return res.status(429).json({
        error: "AI provider quota exceeded",
        retryable: true
      });
    }

    return res.status(500).json({
      error: "AI classification failed",
      retryable: false
    });
  }
});

app.post("/api/order", (req, res) => {
  const { order_id } = req.body;

  if (!order_id) {
    return res.status(400).json({
      error: "order_id is required"
    });
  }

  const order = getOrderById(order_id);

  if (!order) {
    return res.status(404).json({
      error: "Order not found"
    });
  }

  return res.status(200).json(order);
});

app.post("/api/support", async (req, res) => {
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

    const result = await handleSupportRequest(customer_message);

    return res.status(200).json(result);
  } catch (error) {
    console.error("Support request error:", error);

    if (
      error.statusCode === 429 ||
      error.code === "too_many_requests"
    ) {
      return res.status(429).json({
        error: "AI provider quota exceeded",
        retryable: true
      });
    }

    return res.status(500).json({
      error: "Support request failed",
      retryable: false
    });
  }
});

app.listen(PORT, () => {
  console.log(
    `Northstar AI API running on http://localhost:${PORT}`
  );
});