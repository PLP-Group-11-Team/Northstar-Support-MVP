const fs = require("fs");
const path = require("path");

const ordersPath = path.join(__dirname, "..", "data", "orders.json");

function getOrders() {
  const file = fs.readFileSync(ordersPath, "utf8");
  return JSON.parse(file);
}

function getOrderById(orderId) {
  const orders = getOrders();

  return (
    orders.find(
      (order) =>
        order.order_id.toLowerCase() === orderId.toLowerCase()
    ) || null
  );
}

module.exports = {
  getOrderById
};