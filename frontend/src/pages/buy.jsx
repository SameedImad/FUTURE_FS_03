import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar/Navbar.jsx";
import { apiRequest } from "../lib/api.js";
import {
  clearBuyNowItem,
  clearCart,
  getBuyNowItem,
  getCartItems,
  getLastOrderForUser,
  setLastOrder,
} from "../lib/cart.js";
import { getToken, getUser, isLoggedIn } from "../lib/session.js";
import "./shop.css";

const RAZORPAY_SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js";

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }

    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existingScript = document.querySelector(`script[src="${RAZORPAY_SCRIPT_URL}"]`);

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(true), { once: true });
      existingScript.addEventListener("error", () => resolve(false), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = RAZORPAY_SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function normalizeItems(items) {
  return items.map((item) => ({
    id: String(item.id || ""),
    name: String(item.name || "Item"),
    price: Number(item.price || 0),
    quantity: Number(item.quantity || 1),
    category: String(item.category || ""),
  }));
}

function BuyPage() {
  const loggedIn = isLoggedIn();
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  useEffect(() => {
    if (!loggedIn && typeof window !== "undefined") {
      window.location.href = "/login";
    }
  }, [loggedIn]);

  const buyData = useMemo(() => getBuyNowItem(), []);
  const cartItems = getCartItems();
  const user = getUser();

  if (!loggedIn) {
    return null;
  }

  const isCartOrder = buyData?.kind === "cart";
  const rawItems = isCartOrder ? buyData.items || [] : buyData ? [buyData] : cartItems;
  const activeItems = normalizeItems(rawItems);
  const restoredOrder = !activeItems.length ? getLastOrderForUser(user) : null;
  const displayedOrder = confirmedOrder || restoredOrder;
  const items = displayedOrder?.items || activeItems;
  const total = displayedOrder?.total ?? items.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);
  const orderSummaryTitle = displayedOrder
    ? "Order placed successfully"
    : paymentMethod === "online"
      ? "Online payment via Razorpay"
      : "Cash on delivery";

  const createOrderRecord = async (paymentDetails = {}) => {
    const data = await apiRequest("/orders", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({
        customerName: user?.name || "Guest",
        customerEmail: user?.email || "",
        items,
        total,
        paymentMethod,
        paymentStatus: paymentMethod === "online" ? "paid" : "pending",
        ...paymentDetails,
      }),
    });

    setConfirmedOrder(data.order);
    setLastOrder(data.order, user);
    clearBuyNowItem();
    clearCart();
    return data.order;
  };

  const handleCashOnDelivery = async () => {
    setIsSubmitting(true);
    setErrorMessage("");
    setStatusMessage("");

    try {
      await createOrderRecord();
      setStatusMessage("Order placed successfully. Cash on delivery selected.");
    } catch (error) {
      console.error("COD order error", error);
      setErrorMessage(error.message || "Unable to place the order right now.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOnlinePayment = async () => {
    setIsSubmitting(true);
    setErrorMessage("");
    setStatusMessage("");

    try {
      const [paymentConfig, scriptLoaded] = await Promise.all([
        apiRequest("/orders/config"),
        loadRazorpayScript(),
      ]);

      if (!scriptLoaded || !window.Razorpay) {
        throw new Error("Razorpay checkout could not be loaded.");
      }

      let paymentCompleted = false;

      const options = {
        key: paymentConfig.keyId,
        amount: Math.round(total * 100),
        currency: paymentConfig.currency || "INR",
        name: "Royal Delight",
        description: `Payment for ${items.length} item${items.length > 1 ? "s" : ""}`,
        prefill: {
          name: user?.name || "Guest",
          email: user?.email || "",
        },
        theme: {
          color: "#d9292e",
        },
        handler: async (response) => {
          try {
            paymentCompleted = true;
            await createOrderRecord({
              paymentStatus: "paid",
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
            });
            setStatusMessage("Payment successful. Order placed successfully.");
          } catch (error) {
            console.error("Online order error", error);
            setErrorMessage(error.message || "Payment succeeded, but the order could not be saved.");
          } finally {
            setIsSubmitting(false);
          }
        },
        modal: {
          ondismiss: () => {
            if (!paymentCompleted) {
              setIsSubmitting(false);
            }
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Online payment error", error);
      setErrorMessage(error.message || "Unable to start Razorpay checkout.");
      setIsSubmitting(false);
    }
  };

  const handlePlaceOrder = () => {
    if (paymentMethod === "online") {
      void handleOnlinePayment();
      return;
    }

    void handleCashOnDelivery();
  };

  return (
    <div className="shop-page">
      <Navbar variant="customer" />
      <main className="shop-main">
        <section className="shop-hero">
          <div className="shop-hero-card">
            <p className="shop-kicker">Buy page</p>
            <h1 className="shop-title">Review your order before placing it</h1>
            <p className="shop-copy">
              Hi {user?.name || "there"}, choose how you want to pay and place the order. Online checkout opens
              Razorpay test mode, while cash on delivery confirms the order immediately.
            </p>

            {statusMessage ? (
              <div className="shop-success-banner" role="status" aria-live="polite">
                <strong>{orderSummaryTitle}</strong>
                <span>{statusMessage}</span>
              </div>
            ) : null}

            {errorMessage ? (
              <div className="shop-error-banner" role="alert">
                <strong>Checkout problem</strong>
                <span>{errorMessage}</span>
              </div>
            ) : null}
          </div>

          <aside className="shop-side-card">
            <div className="shop-side-stat">
              <strong>₹{total}</strong>
              <span>Order total</span>
            </div>

            <div className="shop-payment-options" role="radiogroup" aria-label="Payment method">
              <label className={`shop-payment-option ${paymentMethod === "online" ? "is-selected" : ""}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="online"
                  checked={paymentMethod === "online"}
                  onChange={() => setPaymentMethod("online")}
                />
                <span>
                  <strong>Online payment</strong>
                  <small>Pay securely with Razorpay test mode.</small>
                </span>
              </label>

              <label className={`shop-payment-option ${paymentMethod === "cod" ? "is-selected" : ""}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={paymentMethod === "cod"}
                  onChange={() => setPaymentMethod("cod")}
                />
                <span>
                  <strong>Cash on delivery</strong>
                  <small>Place the order now and pay when it arrives.</small>
                </span>
              </label>
            </div>

            <div className="shop-action-row">
            {displayedOrder ? (
              <a className="shop-button" href="/dashboard">
                View Orders
              </a>
            ) : (
                <button
                  className="shop-button"
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={isSubmitting || items.length === 0}
                >
                  {isSubmitting ? "Processing..." : "Place Order"}
                </button>
              )}
              <a className="shop-button-secondary" href="/menu">
                Back to Menu
              </a>
            </div>

            <p className="shop-panel-subtitle">
              {displayedOrder
                ? "Your order has been placed successfully."
                : paymentMethod === "online"
                  ? "You will see Razorpay's secure test checkout after clicking Place Order."
                  : "Cash on delivery confirms the order immediately and saves it for admin review."}
            </p>
          </aside>
        </section>

        {items.length === 0 ? (
          <div className="shop-empty">
            <h2>No item selected yet</h2>
            <p>Choose Buy on a card or go to your cart first.</p>
            <div className="shop-action-row" style={{ justifyContent: "center", marginTop: "18px" }}>
              <a className="shop-button" href="/menu">
                Go to Menu
              </a>
            </div>
          </div>
        ) : (
          <section className="shop-buy-panel">
            <p className="shop-buy-badge">
              {displayedOrder ? "Order confirmed" : isCartOrder ? "Cart checkout" : "Single item checkout"}
            </p>

            <div className="shop-cart-list">
              {items.map((item) => (
                <article className="shop-cart-item" key={item.id}>
                  <div className="shop-cart-item-row">
                    <div>
                      <h3 className="shop-cart-item-title">{item.name}</h3>
                      <p className="shop-cart-item-meta">
                        {item.quantity || 1} item{(item.quantity || 1) > 1 ? "s" : ""} · {item.category.replace("-", " ")}
                      </p>
                    </div>
                    <span className="shop-card-price">₹{item.price * (item.quantity || 1)}</span>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default BuyPage;
