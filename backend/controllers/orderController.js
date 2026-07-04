const Order = require("../models/Order");

function normalizeDeliveryDetails(deliveryDetails = {}) {
  return {
    fullName: String(deliveryDetails.fullName || "").trim(),
    phone: String(deliveryDetails.phone || "").trim(),
    addressLine1: String(deliveryDetails.addressLine1 || "").trim(),
    addressLine2: String(deliveryDetails.addressLine2 || "").trim(),
    city: String(deliveryDetails.city || "").trim(),
    state: String(deliveryDetails.state || "").trim(),
    pincode: String(deliveryDetails.pincode || "").trim(),
    instructions: String(deliveryDetails.instructions || "").trim(),
  };
}

const getRazorpayConfig = (req, res) => {
  return res.status(200).json({
    success: true,
    keyId: process.env.RAZORPAY_TEST_KEY || "",
    currency: "INR",
  });
};

const createOrder = async (req, res) => {
  try {
    const {
      customerName,
      customerEmail,
      deliveryDetails,
      items,
      total,
      paymentMethod,
      paymentStatus,
      razorpayPaymentId,
      razorpayOrderId,
      razorpaySignature,
    } = req.body || {};

    if (!customerName || !Array.isArray(items) || items.length === 0 || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: "Please provide the order details",
      });
    }

    const normalizedDeliveryDetails = normalizeDeliveryDetails(deliveryDetails);
    const requiredDeliveryFields = ["fullName", "phone", "addressLine1", "city", "state", "pincode"];
    const hasAllDeliveryFields = requiredDeliveryFields.every(
      (field) => normalizedDeliveryDetails[field] && normalizedDeliveryDetails[field].length > 0
    );

    if (!hasAllDeliveryFields) {
      return res.status(400).json({
        success: false,
        message: "Please provide delivery details",
      });
    }

    const parsedTotal = Number(total);

    if (!Number.isFinite(parsedTotal) || parsedTotal <= 0) {
      return res.status(400).json({
        success: false,
        message: "Order total must be greater than zero",
      });
    }

    const normalizedItems = items.map((item) => ({
      id: String(item.id || ""),
      name: String(item.name || "Item"),
      price: Number(item.price || 0),
      quantity: Number(item.quantity || 1),
      category: String(item.category || ""),
    }));

    const order = await Order.create({
      customerName,
      customerEmail: customerEmail || "",
      deliveryDetails: normalizedDeliveryDetails,
      userId: req.user?.id || "",
      items: normalizedItems,
      total: parsedTotal,
      paymentMethod,
      paymentStatus: paymentStatus || (paymentMethod === "online" ? "paid" : "pending"),
      status: "placed",
      razorpayPaymentId: razorpayPaymentId || "",
      razorpayOrderId: razorpayOrderId || "",
      razorpaySignature: razorpaySignature || "",
    });

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    console.error("Create Order Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const getOrders = async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const orders = await Order.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Fetch Orders Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const userId = req.user?.id || "";
    const userEmail = typeof req.user?.email === "string" ? req.user.email.toLowerCase() : "";

    const query = {
      $or: [],
    };

    if (userId) {
      query.$or.push({ userId });
    }

    if (userEmail) {
      query.$or.push({ customerEmail: userEmail });
    }

    if (query.$or.length === 0) {
      return res.status(200).json({
        success: true,
        orders: [],
      });
    }

    const orders = await Order.find(query).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Fetch My Orders Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const { id } = req.params;
    const { status } = req.body || {};

    if (!id || !status) {
      return res.status(400).json({
        success: false,
        message: "Order id and status are required",
      });
    }

    const allowedStatuses = ["accepted", "shipped", "out_for_delivery", "delivered", "completed"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      {
        status,
      },
      { returnDocument: "after" }
    );

    if (!updatedOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Order updated successfully",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Update Order Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  createOrder,
  getOrders,
  getMyOrders,
  updateOrderStatus,
  getRazorpayConfig,
};
