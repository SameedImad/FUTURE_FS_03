const express = require("express");
const protect = require("../middlewares/authMiddleware");
const {
  createOrder,
  getOrders,
  getMyOrders,
  updateOrderStatus,
  getRazorpayConfig,
} = require("../controllers/orderController");

const router = express.Router();

router.get("/config", getRazorpayConfig);
router.get("/me", protect, getMyOrders);
router.post("/", protect, createOrder);
router.get("/", protect, getOrders);
router.patch("/:id/status", protect, updateOrderStatus);

module.exports = router;
