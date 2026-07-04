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
// buy page
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

function getInitialDeliveryDetails(user) {
  return {
    fullName: user?.name || "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    instructions: "",
  };
}

function getTrimmedDeliveryDetails(details) {
  return {
    fullName: String(details.fullName || "").trim(),
    phone: String(details.phone || "").trim(),
    addressLine1: String(details.addressLine1 || "").trim(),
    addressLine2: String(details.addressLine2 || "").trim(),
    city: String(details.city || "").trim(),
    state: String(details.state || "").trim(),
    pincode: String(details.pincode || "").trim(),
    instructions: String(details.instructions || "").trim(),
  };
}

function getDeliveryDetailsError(details) {
  const requiredFields = {
    fullName: "receiver name",
    phone: "mobile number",
    addressLine1: "street address",
    city: "city",
    state: "state",
    pincode: "pincode",
  };
  const trimmed = getTrimmedDeliveryDetails(details);

  for (const [key, label] of Object.entries(requiredFields)) {
    if (!trimmed[key]) {
      return `Please add your ${label}.`;
    }
  }

  return "";
}

function BuyPage() {
  const loggedIn = isLoggedIn();
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [deliveryDetails, setDeliveryDetails] = useState(() => getInitialDeliveryDetails(getUser()));

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
  const displayedDeliveryDetails = displayedOrder?.deliveryDetails || deliveryDetails;
  const orderSummaryTitle = displayedOrder
    ? "Order placed successfully"
    : paymentMethod === "online"
      ? "Online payment via Razorpay"
      : "Cash on delivery";

  const createOrderRecord = async (paymentDetails = {}) => {
    const normalizedDeliveryDetails = getTrimmedDeliveryDetails(deliveryDetails);
    const data = await apiRequest("/orders", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({
        customerName: normalizedDeliveryDetails.fullName || user?.name || "Guest",
        customerEmail: user?.email || "",
        items,
        total,
        paymentMethod,
        paymentStatus: paymentMethod === "online" ? "paid" : "pending",
        deliveryDetails: normalizedDeliveryDetails,
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
    const deliveryError = getDeliveryDetailsError(deliveryDetails);

    if (deliveryError) {
      setErrorMessage(deliveryError);
      return;
    }

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
    const deliveryError = getDeliveryDetailsError(deliveryDetails);

    if (deliveryError) {
      setErrorMessage(deliveryError);
      return;
    }

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
          name: deliveryDetails.fullName || user?.name || "Guest",
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
    <div className="shop-page buy-page">
      <Navbar variant="customer" />
      <main className="shop-main buy-main">
        <section className="shop-hero-card buy-review-card">
          <div className="buy-review-copy">
            <p className="shop-kicker">Buy page</p>
            <h1 className="shop-title">Review your order before placing it</h1>
            <p className="shop-copy">
              Hi {user?.name || "there"}, choose how you want to pay and place the order. Online checkout opens
              Razorpay test mode, while cash on delivery confirms the order immediately.
            </p>
          </div>

          {items.length === 0 ? (
            <div className="shop-empty buy-empty-card">
              <h2>No item selected yet</h2>
              <p>Choose Buy on a card or go to your cart first.</p>
              <div className="shop-action-row" style={{ justifyContent: "center", marginTop: "18px" }}>
                <a className="shop-button" href="/menu">
                  Go to Menu
                </a>
              </div>
            </div>
          ) : (
            <section className="shop-buy-panel buy-cart-card">
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
                          {item.quantity || 1} item{(item.quantity || 1) > 1 ? "s" : ""} ·{" "}
                          {item.category.replace("-", " ")}
                        </p>
                      </div>
                      <span className="shop-card-price">₹{item.price * (item.quantity || 1)}</span>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

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
        </section>

        <section className="buy-checkout-layout">
          <div className="shop-delivery-card buy-delivery-card">
            <div className="shop-delivery-header">
              <div>
                <p className="shop-delivery-kicker">Delivery details</p>
                <h2 className="shop-delivery-title">Where should we send your order?</h2>
              </div>
              {displayedOrder ? <span className="shop-delivery-badge">Saved for admin review</span> : null}
            </div>

            {displayedOrder ? (
              <div className="shop-delivery-summary">
                <div>
                  <strong>{displayedDeliveryDetails.fullName || "Recipient"}</strong>
                  <span>{displayedDeliveryDetails.phone || "No phone number"}</span>
                </div>
                <p>
                  {displayedDeliveryDetails.addressLine1}
                  {displayedDeliveryDetails.addressLine2 ? `, ${displayedDeliveryDetails.addressLine2}` : ""}
                </p>
                <p>
                  {displayedDeliveryDetails.city}, {displayedDeliveryDetails.state} - {displayedDeliveryDetails.pincode}
                </p>
                {displayedDeliveryDetails.instructions ? <p>{displayedDeliveryDetails.instructions}</p> : null}
              </div>
            ) : (
              <div className="shop-delivery-form">
                <label className="shop-field">
                  <span>Receiver name</span>
                  <input
                    type="text"
                    value={deliveryDetails.fullName}
                    onChange={(event) =>
                      setDeliveryDetails((current) => ({ ...current, fullName: event.target.value }))
                    }
                    placeholder="Full name"
                  />
                </label>
                <label className="shop-field">
                  <span>Mobile number</span>
                  <input
                    type="tel"
                    value={deliveryDetails.phone}
                    onChange={(event) =>
                      setDeliveryDetails((current) => ({ ...current, phone: event.target.value }))
                    }
                    placeholder="10-digit phone number"
                  />
                </label>
                <label className="shop-field shop-field-wide">
                  <span>Address line 1</span>
                  <input
                    type="text"
                    value={deliveryDetails.addressLine1}
                    onChange={(event) =>
                      setDeliveryDetails((current) => ({ ...current, addressLine1: event.target.value }))
                    }
                    placeholder="Flat, house no., street"
                  />
                </label>
                <label className="shop-field shop-field-wide">
                  <span>Address line 2</span>
                  <input
                    type="text"
                    value={deliveryDetails.addressLine2}
                    onChange={(event) =>
                      setDeliveryDetails((current) => ({ ...current, addressLine2: event.target.value }))
                    }
                    placeholder="Landmark, area, optional"
                  />
                </label>
                <label className="shop-field">
                  <span>City</span>
                  <input
                    type="text"
                    value={deliveryDetails.city}
                    onChange={(event) => setDeliveryDetails((current) => ({ ...current, city: event.target.value }))}
                    placeholder="City"
                  />
                </label>
                <label className="shop-field">
                  <span>State</span>
                  <input
                    type="text"
                    value={deliveryDetails.state}
                    onChange={(event) => setDeliveryDetails((current) => ({ ...current, state: event.target.value }))}
                    placeholder="State"
                  />
                </label>
                <label className="shop-field">
                  <span>Pincode</span>
                  <input
                    type="text"
                    value={deliveryDetails.pincode}
                    onChange={(event) =>
                      setDeliveryDetails((current) => ({ ...current, pincode: event.target.value }))
                    }
                    placeholder="Postal code"
                  />
                </label>
              </div>
            )}
          </div>

          <aside className="shop-side-card buy-total-card">
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
      </main>
    </div>
  );
}

export default BuyPage;
