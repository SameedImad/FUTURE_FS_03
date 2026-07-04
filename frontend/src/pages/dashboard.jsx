import { useEffect, useState } from "react";
import Navbar from "../components/Navbar/Navbar.jsx";
import { apiRequest } from "../lib/api.js";
import { getToken, getUser, isLoggedIn } from "../lib/session.js";
import "./account.css";

const TRACK_STEPS = [
  { key: "placed", label: "Order Confirmed" },
  { key: "accepted", label: "Accepted" },
  { key: "shipped", label: "Shipped" },
  { key: "out_for_delivery", label: "Delivery" },
];

function formatOrderTitle(order) {
  const firstItem = order.items?.[0]?.name || "Order";

  if (!order.items || order.items.length <= 1) {
    return firstItem;
  }

  return `${firstItem} + ${order.items.length - 1} more`;
}

function getOrderLabel(order) {
  if (order.status === "delivered" || order.status === "completed" || order.paymentStatus === "paid") {
    return "Completed";
  }

  if (order.status === "out_for_delivery") return "On the way";
  if (order.status === "shipped") return "Shipped";
  if (order.status === "accepted") return "Accepted";
  return "Pending";
}

function getStepIndex(order) {
  const mapped = TRACK_STEPS.findIndex((stage) => stage.key === order.status);
  if (mapped >= 0) return mapped;
  if (order.status === "delivered" || order.status === "completed") return TRACK_STEPS.length - 1;
  return 0;
}

function formatDeliveryAddress(deliveryDetails) {
  if (!deliveryDetails) {
    return "Delivery details not available";
  }

  const lines = [
    deliveryDetails.addressLine1,
    deliveryDetails.addressLine2,
    [deliveryDetails.city, deliveryDetails.state].filter(Boolean).join(", "),
    deliveryDetails.pincode,
  ].filter(Boolean);

  return lines.join(" · ");
}

function DashboardPage() {
  const loggedIn = isLoggedIn();
  const user = getUser();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!loggedIn && typeof window !== "undefined") {
      window.location.href = "/login";
      return;
    }

    const loadOrders = async () => {
      try {
        const data = await apiRequest("/orders/me", {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        });

        setOrders(data.orders || []);
      } catch (error) {
        console.error("Load customer orders error", error);
        setErrorMessage(error.message || "Could not load your orders.");
      } finally {
        setLoading(false);
      }
    };

    void loadOrders();
  }, [loggedIn]);

  if (!loggedIn) {
    return null;
  }

  const currentOrders = orders.filter((order) => !["delivered", "completed"].includes(order.status));
  const successfulOrders = orders.filter((order) => order.status === "delivered" || order.status === "completed");

  return (
    <div className="account-page">
      <Navbar variant="customer" />
      <main className="account-main">
        <section className="account-hero">
          <div className="account-hero-card">
            <p className="account-kicker">My orders</p>
            <h1 className="account-title">Hi {user?.name || "Guest"}</h1>
            <p className="account-copy">Track your current order and see finished orders below.</p>
          </div>

          <div className="account-stat-grid" aria-label="Quick stats">
            <article className="account-stat">
              <span className="account-stat-label">Current Orders</span>
              <span className="account-stat-value">{currentOrders.length}</span>
            </article>
            <article className="account-stat">
              <span className="account-stat-label">Successful</span>
              <span className="account-stat-value">{successfulOrders.length}</span>
            </article>
          </div>
        </section>

        <section className="account-sections">
          <article className="account-panel" id="current-orders">
            <div className="account-panel-header">
              <h2 className="account-panel-title">Current Orders</h2>
              <span className="account-panel-badge">In progress</span>
            </div>

            {loading ? (
              <p className="account-copy">Loading orders...</p>
            ) : errorMessage ? (
              <p className="account-copy">{errorMessage}</p>
            ) : currentOrders.length === 0 ? (
              <p className="account-copy">No current orders right now.</p>
            ) : (
              <div className="account-list">
                {currentOrders.map((order) => {
                  const stepIndex = getStepIndex(order);
                  const done = order.status === "delivered" || order.status === "completed";
                  const statusText = getOrderLabel(order);

                  return (
                    <div className="account-item account-track-card" key={order._id}>
                      <div className="account-track-header">
                        <div>
                          <p className="account-track-kicker">Order Tracking</p>
                          <h3 className="account-track-title">{formatOrderTitle(order)}</h3>
                        </div>
                        <span className={`account-track-pill ${done ? "is-complete" : "is-pending"}`}>{statusText}</span>
                      </div>

                      <p className="account-track-copy">
                        {done
                          ? "Your order has been delivered successfully."
                          : order.status === "out_for_delivery"
                            ? "Your order is on the way."
                            : order.status === "shipped"
                              ? "Your order has left the kitchen."
                              : order.status === "accepted"
                                ? "Your order has been accepted."
                                : "Your order is being prepared."}
                      </p>

                      <div className="account-stepper" aria-label="Order progress">
                        {TRACK_STEPS.map((stage, index) => {
                          const isComplete = index <= stepIndex;
                          const isCurrent = index === stepIndex && !done;
                          const connectorFilled = index < stepIndex || done;

                          return (
                            <div className="account-stepper-item" key={stage.key}>
                              <div className="account-stepper-node">
                                <span className={`account-stepper-dot ${isComplete ? "is-complete" : ""} ${isCurrent ? "is-current" : ""}`}>
                                  {isComplete ? "✓" : ""}
                                </span>
                                {index < TRACK_STEPS.length - 1 ? (
                                  <span className={`account-stepper-connector ${connectorFilled ? "is-filled" : ""}`} />
                                ) : null}
                              </div>
                              <span className="account-stepper-label">{stage.label}</span>
                            </div>
                          );
                        })}
                      </div>

                      <div className="account-track-details">
                        <span>{order.paymentMethod === "online" ? "Online payment" : "Cash on delivery"}</span>
                        <span>₹{order.total}</span>
                      </div>

                      <div className="account-delivery-details">
                        <p className="account-delivery-title">Delivery details</p>
                        <div className="account-delivery-grid">
                          <span>{order.deliveryDetails?.fullName || order.customerName}</span>
                          <span>{order.deliveryDetails?.phone || "No phone provided"}</span>
                          <span>{formatDeliveryAddress(order.deliveryDetails)}</span>
                          {order.deliveryDetails?.instructions ? (
                            <span>Note: {order.deliveryDetails.instructions}</span>
                          ) : null}
                        </div>
                      </div>

                      <p className="account-track-note">
                        The delivery address is attached to this order for customer tracking and admin handling.
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </article>

          <article className="account-panel" id="successful-orders">
            <div className="account-panel-header">
              <h2 className="account-panel-title">Successful Orders</h2>
              <span className="account-panel-badge account-panel-badge-success">Completed</span>
            </div>

            {loading ? (
              <p className="account-copy">Loading orders...</p>
            ) : errorMessage ? (
              <p className="account-copy">{errorMessage}</p>
            ) : successfulOrders.length === 0 ? (
              <p className="account-copy">No successful orders yet.</p>
            ) : (
              <div className="account-list">
                {successfulOrders.map((order) => (
                  <div className="account-item" key={order._id}>
                    <div className="account-item-row">
                      <div>
                        <h3 className="account-item-title">{formatOrderTitle(order)}</h3>
                        <p className="account-item-meta">
                          {order.paymentMethod === "online" ? "Online payment" : "Cash on delivery"} · Completed
                        </p>
                      </div>
                      <span className="account-price">₹{order.total}</span>
                    </div>
                    <p className="account-item-meta">
                      {order.items?.map((item) => `${item.quantity || 1}x ${item.name}`).join(", ")}
                    </p>
                    <div className="account-delivery-details">
                      <p className="account-delivery-title">Delivery details</p>
                      <div className="account-delivery-grid">
                        <span>{order.deliveryDetails?.fullName || order.customerName}</span>
                        <span>{order.deliveryDetails?.phone || "No phone provided"}</span>
                        <span>{formatDeliveryAddress(order.deliveryDetails)}</span>
                        {order.deliveryDetails?.instructions ? (
                          <span>Note: {order.deliveryDetails.instructions}</span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </article>
        </section>
      </main>
    </div>
  );
}

export default DashboardPage;
