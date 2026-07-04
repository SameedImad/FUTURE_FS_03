import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar/Navbar.jsx";
import { clearCart, getCartItems, addToCart, setBuyNowItem } from "../lib/cart.js";
import { getUser, isLoggedIn } from "../lib/session.js";
import { menuCategories, menuItems } from "../data/menuItems.js";
import "./shop.css";

function MenuPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [cartVersion, setCartVersion] = useState(0);
  const [notice, setNotice] = useState("");

  const loggedIn = isLoggedIn();

  useEffect(() => {
    if (!loggedIn && typeof window !== "undefined") {
      window.location.href = "/login";
    }
  }, [loggedIn]);

  const visibleItems = useMemo(() => {
    if (activeCategory === "all") return menuItems;
    return menuItems.filter((item) => item.category === activeCategory);
  }, [activeCategory, cartVersion]);

  const activeCategoryLabel =
    menuCategories.find((category) => category.slug === activeCategory)?.label || "All";
  const panelTitle = activeCategory === "all" ? "All dishes" : activeCategoryLabel;

  if (!loggedIn) {
    return null;
  }

  const user = getUser();
  const cartItems = getCartItems();
  const cartCount = cartItems.reduce((total, item) => total + (item.quantity || 1), 0);

  const handleAddToCart = (item) => {
    addToCart(item);
    setCartVersion((value) => value + 1);
    setNotice(`${item.name} added to cart`);
    window.setTimeout(() => setNotice(""), 1500);
  };

  const handleBuyNow = (item) => {
    setBuyNowItem(item);
    window.location.href = "/buy";
  };

  const handleClearCart = () => {
    clearCart();
    setCartVersion((value) => value + 1);
    setNotice("Cart cleared");
    window.setTimeout(() => setNotice(""), 1500);
  };

  return (
    <div className="shop-page">
      <Navbar variant="customer" />
      <main className="shop-main">
        <section className="shop-hero">
          <div className="shop-hero-card">
            <p className="shop-kicker">Food menu</p>
            <h1 className="shop-title">Choose your starter, rice, biryani, or shake</h1>
            <p className="shop-copy">
              Hi {user?.name || "there"}, this menu is grouped by category just like the board photo. Tap a filter to show only veg starters, non-veg starters, noodles, curries, biryani, shakes, rice items, or rotis.
            </p>
          </div>

          <aside className="shop-side-card" aria-label="Cart summary">
            <div className="shop-side-stat">
              <strong>{cartCount}</strong>
              <span>Items in your cart</span>
            </div>

            <div className="shop-action-row">
              <a className="shop-button" href="/cart">
                View My Cart
              </a>
              <button className="shop-button-secondary" type="button" onClick={handleClearCart}>
                Clear Cart
              </button>
            </div>

            <p className="shop-panel-subtitle">
              {notice || "Each card has Buy and Add to Cart, so the flow stays quick and simple."}
            </p>
          </aside>
        </section>

        <section className="shop-section">
          <div className="shop-filters" role="tablist" aria-label="Food categories">
            {menuCategories.map((category) => (
              <button
                key={category.slug}
                type="button"
                className={`shop-filter-chip ${activeCategory === category.slug ? "is-active" : ""}`}
                onClick={() => setActiveCategory(category.slug)}
              >
                {category.label}
              </button>
            ))}
          </div>

          <div className="shop-panel">
            <div className="shop-panel-header">
              <div>
                <h2 className="shop-panel-title">{panelTitle}</h2>
                <p className="shop-panel-subtitle">
                  Showing {visibleItems.length} item{visibleItems.length === 1 ? "" : "s"}
                </p>
              </div>
              <a className="shop-small-button" href="/dashboard">
                My Orders
              </a>
            </div>

            <div className="shop-grid">
              {visibleItems.map((item) => (
                <article className="shop-card" key={item.id}>
                  <div className="shop-card-image">
                    <img src={item.image} alt={item.name} loading="lazy" decoding="async" />
                    <span className="shop-card-badge">{item.category.replace("-", " ")}</span>
                  </div>

                  <div className="shop-card-body">
                    <div className="shop-card-row">
                      <h3 className="shop-card-title">{item.name}</h3>
                      <span className="shop-card-price">₹{item.price}</span>
                    </div>
                    <p className="shop-card-text">{item.description}</p>

                    <div className="shop-card-actions">
                      <button
                        type="button"
                        className="shop-card-button-secondary"
                        onClick={() => handleAddToCart(item)}
                      >
                        Add to Cart
                      </button>
                      <button type="button" className="shop-card-button" onClick={() => handleBuyNow(item)}>
                        Buy
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default MenuPage;
