import { useEffect, useState } from "react";
import Navbar from "../components/Navbar/Navbar.jsx";
import { apiRequest } from "../lib/api.js";
import { getToken, getUser, isLoggedIn } from "../lib/session.js";
import "./account.css";

const ORDER_STAGES = [
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

function getStatusLabel(order) {
  if (order.status === "delivered" || order.status === "completed" || order.paymentStatus === "paid") {
    return "Completed";
  }

  if (order.status === "out_for_delivery") return "Out for delivery";
  if (order.status === "shipped") return "Shipped";
  if (order.status === "accepted") return "Accepted";
  return "Pending";
}

function formatOrderMeta(order) {
  const paymentLabel = order.paymentMethod === "online" ? "Online payment" : "Cash on delivery";
  const dateLabel = order.createdAt ? new Date(order.createdAt).toLocaleString() : "Just now";

  return `${paymentLabel} · ${dateLabel}`;
}

function getOrderStepIndex(order) {
  const mapped = ORDER_STAGES.findIndex((stage) => stage.key === order.status);

  if (mapped >= 0) {
    return mapped;
  }

  if (order.status === "delivered" || order.status === "completed") {
    return ORDER_STAGES.length - 1;
  }

  return 0;
}

function AdminPage() {
  const loggedIn = isLoggedIn();
  const user = getUser();
  const userRole = user?.role;
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [savingId, setSavingId] = useState("");

  const loadOrders = async () => {
    try {
      const data = await apiRequest("/orders", {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      setOrders(data.orders || []);
    } catch (error) {
      console.error("Load orders error", error);
      setErrorMessage(error.message || "Could not load orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!loggedIn && typeof window !== "undefined") {
      window.location.href = "/login";
      return;
    }

    if (userRole && userRole !== "admin" && typeof window !== "undefined") {
      window.location.href = "/dashboard";
      return;
    }

    void loadOrders();
  }, [loggedIn, userRole]);

  if (!loggedIn || (userRole && userRole !== "admin")) {
    return null;
  }

  const totalOrders = orders.length;
  const completedOrders = orders.filter(
    (order) => order.status === "delivered" || order.status === "completed" || order.paymentStatus === "paid"
  ).length;
  const pendingOrders = orders.filter((order) => !["delivered", "completed"].includes(order.status)).length;

  const handleStatusUpdate = async (orderId, status) => {
    setSavingId(orderId);
    setErrorMessage("");

    try {
      const data = await apiRequest(`/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          status,
        }),
      });

      setOrders((currentOrders) => currentOrders.map((order) => (order._id === orderId ? data.order : order)));
    } catch (error) {
      console.error("Update order error", error);
      setErrorMessage(error.message || "Could not update the order.");
    } finally {
      setSavingId("");
    }
  };

  return (
    <div className="account-page">
      <Navbar variant="admin" />
      <main className="account-main">
        <section className="account-hero">
          <div className="account-hero-card">
            <p className="account-kicker">Admin area</p>
            <h1 className="account-title">Welcome, {user?.name || "Admin"}</h1>
            <p className="account-copy">Move each order through the delivery stages with simple buttons.</p>
          </div>

          <div className="account-stat-grid" aria-label="Quick stats">
            <article className="account-stat">
              <span className="account-stat-label">Total Orders</span>
              <span className="account-stat-value">{totalOrders}</span>
            </article>
            <article className="account-stat">
              <span className="account-stat-label">Completed</span>
              <span className="account-stat-value">{completedOrders}</span>
            </article>
            <article className="account-stat">
              <span className="account-stat-label">Pending</span>
              <span className="account-stat-value">{pendingOrders}</span>
            </article>
          </div>
        </section>

        <section className="account-sections">
          <article className="account-panel account-panel-wide" id="orders">
            <div className="account-panel-header">
              <h2 className="account-panel-title">Orders</h2>
              <span className="account-panel-badge">Manage Orders</span>
            </div>

            {loading ? (
              <p className="account-copy">Loading orders...</p>
            ) : errorMessage ? (
              <p className="account-copy">{errorMessage}</p>
            ) : orders.length === 0 ? (
              <p className="account-copy">No orders have been placed yet.</p>
            ) : (
              <div className="account-list">
                {orders.map((order) => {
                  const isDone = order.status === "delivered" || order.status === "completed" || order.paymentStatus === "paid";
                  const currentStageIndex = getOrderStepIndex(order);
                  const nextStage =
                    order.status === "placed"
                      ? "accepted"
                      : order.status === "accepted"
                        ? "shipped"
                        : order.status === "shipped"
                          ? "out_for_delivery"
                          : order.status === "out_for_delivery"
                            ? "delivered"
                            : null;

                  return (
                    <div className="account-item account-track-card" key={order._id}>
                      <div className="account-track-header">
                        <div>
                          <p className="account-track-kicker">Order tracking</p>
                          <h3 className="account-item-title">{formatOrderTitle(order)}</h3>
                          <p className="account-item-meta">{formatOrderMeta(order)}</p>
                        </div>
                        <span className={`account-track-pill ${isDone ? "is-complete" : "is-pending"}`}>
                          {getStatusLabel(order)}
                        </span>
                      </div>

                      <p className="account-track-copy">
                        {order.items?.length ? `${order.items.length} item${order.items.length === 1 ? "" : "s"} in this order` : "No item details available"}
                      </p>

                      <div className="account-stepper" aria-label="Order progress">
                        {ORDER_STAGES.map((stage, index) => {
                          const stageCompleted = index <= currentStageIndex;
                          const isCurrent = order.status === stage.key;
                          const connectorFilled = index < currentStageIndex || isDone;
                          return (
                            <div className="account-stepper-item" key={stage.key}>
                              <div className="account-stepper-node">
                                <span className={`account-stepper-dot ${stageCompleted ? "is-complete" : ""} ${isCurrent ? "is-current" : ""}`}>
                                  {stageCompleted ? "✓" : ""}
                                </span>
                                {index < ORDER_STAGES.length - 1 ? (
                                  <span className={`account-stepper-connector ${connectorFilled ? "is-filled" : ""}`} />
                                ) : null}
                              </div>
                              <span className="account-stepper-label">{stage.label}</span>
                            </div>
                          );
                        })}
                      </div>

                      <div className="account-track-details">
                        <span>{order.customerName}</span>
                        <span>{order.customerEmail || "No email provided"}</span>
                      </div>

                      <p className="account-track-note">
                        Use the action below to move the order to the next delivery stage.
                      </p>

                      <div className="account-item-actions">
                        {nextStage ? (
                          <button
                            type="button"
                            className="account-accept-button"
                            onClick={() => handleStatusUpdate(order._id, nextStage)}
                            disabled={savingId === order._id}
                          >
                            {savingId === order._id
                              ? "Saving..."
                              : nextStage === "accepted"
                                ? "Accept"
                                : nextStage === "shipped"
                                  ? "Mark Shipped"
                                  : nextStage === "out_for_delivery"
                                    ? "Out for Delivery"
                            : "Deliver"}
                          </button>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </article>
        </section>
      </main>
    </div>
  );
}

export default AdminPage;
