import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar/Navbar.jsx";
import { clearCart, getCartItems, removeFromCart, setBuyNowItem } from "../lib/cart.js";
import { getUser, isLoggedIn } from "../lib/session.js";
import "./shop.css";

function CartPage() {
  const [cartVersion, setCartVersion] = useState(0);

  const loggedIn = isLoggedIn();

  useEffect(() => {
    if (!loggedIn && typeof window !== "undefined") {
      window.location.href = "/login";
    }
  }, [loggedIn]);

  if (!loggedIn) {
    return null;
  }

  const user = getUser();
  const cartItems = useMemo(() => getCartItems(), [cartVersion]);
  const total = cartItems.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);

  const handleRemove = (id) => {
    removeFromCart(id);
    setCartVersion((value) => value + 1);
  };

  const handleClear = () => {
    clearCart();
    setCartVersion((value) => value + 1);
  };

  const handleBuyCart = () => {
    if (cartItems.length > 0) {
      setBuyNowItem({ kind: "cart", items: cartItems, total });
      window.location.href = "/buy";
    }
  };

  return (
    <div className="shop-page">
      <Navbar variant="customer" />
      <main className="shop-main">
        <section className="shop-hero">
          <div className="shop-hero-card">
            <p className="shop-kicker">View my cart</p>
            <h1 className="shop-title">Your favorite dishes are waiting for you.</h1>
            <p className="shop-copy">
              Hi {user?.name || "there"}, this is your cart. Remove items, clear everything, or continue to the buy page when you’re ready.
            </p>
          </div>

          <aside className="shop-side-card">
            <div className="shop-side-stat">
              <strong>{cartItems.length}</strong>
              <span>Items saved in cart</span>
            </div>

            <div className="shop-action-row">
              <button className="shop-button" type="button" onClick={handleBuyCart} disabled={cartItems.length === 0}>
                Proceed to Buy
              </button>
              <button className="shop-button-secondary" type="button" onClick={handleClear}>
                Clear Cart
              </button>
            </div>

            <p className="shop-panel-subtitle">
              Total amount: ₹{total}
            </p>
          </aside>
        </section>

        {cartItems.length === 0 ? (
          <div className="shop-empty">
            <h2>Your cart is empty</h2>
            <p>Go back to the menu and add a few dishes first.</p>
            <div className="shop-action-row" style={{ justifyContent: "center", marginTop: "18px" }}>
              <a className="shop-button" href="/menu">
                Back to Menu
              </a>
            </div>
          </div>
        ) : (
          <section className="shop-cart-layout">
            <div className="shop-cart-panel">
              <div className="shop-panel-header">
                <div>
                  <h2 className="shop-panel-title">Cart items</h2>
                  <p className="shop-panel-subtitle">Tap remove if you want to trim the list</p>
                </div>
              </div>

              <div className="shop-cart-list">
                {cartItems.map((item) => (
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

                    <div className="shop-card-actions">
                      <button type="button" className="shop-small-button" onClick={() => handleRemove(item.id)}>
                        Remove
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <aside className="shop-buy-panel">
              <p className="shop-buy-badge">Order summary</p>
              <div className="shop-summary">
                <div className="shop-summary-row">
                  <span>Items</span>
                  <span>{cartItems.length}</span>
                </div>
                <div className="shop-summary-row">
                  <span>Subtotal</span>
                  <span>₹{total}</span>
                </div>
                <div className="shop-summary-row">
                  <span>Delivery</span>
                  <span>Free</span>
                </div>
              </div>

              <div className="shop-action-row" style={{ marginTop: "18px" }}>
                <button className="shop-button" type="button" onClick={handleBuyCart}>
                  Buy Now
                </button>
                <a className="shop-button-secondary" href="/menu">
                  Add More
                </a>
              </div>
            </aside>
          </section>
        )}
      </main>
    </div>
  );
}

export default CartPage;
