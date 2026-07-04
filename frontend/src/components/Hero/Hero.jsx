import { useState } from "react";
import "./Hero.css";
import heroImage from "../../assets/hero/biryani-hero.png";
import chickenBiryaniImage from "../../assets/top/2wr0I54D86rEjrRUIZnhpme-Xbj0HeZt_U0J1XAWtspsKoihMuO94CMTowTSuxr8tHASjQwR_5NKoNahZJ4BoyULBFHTbAUyiZ8xXunYdGki6jTT9Q51VHMcjf6HXX1wq5aSeIro98CL4cFpbqab5Sci8ng8ntIvZ-5Y6ECldhi7m7Jockna9s3ueeseh2vd.jpeg";
import butterChickenImage from "../../assets/top/KOyuFpN162M-UY_XO88-4A3b9C2WKHMNSvptGR0xmZWnCkSHLzRM5fgUE2yULjE_KOH62Wo2noyZlU9Z3lxRLS-ndTCRR86BvVUms48tTF9nT8JyNl7tB051omOqcjV2OCJbL6ewoaOjenNcoTPLgDm5K81Lw61wgm4-xxDWW06trek5Snrhs7L0J_K6jGyW.jpeg";
import veg from "../../assets/top/j7UD1N5657ZeISfYkOyplTcaNmtVusNl032vw2bNRgt-b2ZJBum5CcsD7mksnYPi_VJXtbSHbuTYUjFPYfjtMed9lI3YxlKeHGjS68PqvTL_Xe4sCq1L-kaoiZYdUXZLT8w9NydRnUdreanODjDdWgIi5XwgN8_NQ9FYFz4ohxo.jpeg"
import paneer from "../../assets/top/Jb02zfcsJ-UDC70fyMoLE9Z-j5nNdiCh_mISlmHgZBYFEisauNxt80PqWP1KQ_togkS1wPD0vVZs-At9Fa76tXogfRxJ78aeKFpRwwqLmfviDU1vdvNkL6NeANsnSXkRC9qyOS21R5V2ijY54xAskOBu9m0Qgb9_2bvltq8QDXschVAG8Q3WtPQ48C8l3hGz.jpeg"
import chicken from "../../assets/top/0dbb6860-cc78-4ccf-9c65-48b4e8bfac24.png"
import { getUser, isLoggedIn } from "../../lib/session.js";

const topFoods = [
  {
    name: "Chicken Biryani",
    price: "₹299",
    rating: "⭐ 4.9",
    badge: "Bestseller",
    image: chickenBiryaniImage,
    alt: "Chicken biryani served in a round bowl",
    objectPosition: "center",
  },
  {
    name: "Butter Chicken",
    price: "₹349",
    rating: "⭐ 4.8",
    badge: "Chef's Special",
    image: butterChickenImage,
    alt: "Butter chicken curry in a white bowl",
    objectPosition: "center",
  },
  {
    name: "Veg Biryani",
    price: "₹249",
    rating: "⭐ 4.7",
    badge: "Fresh & Flavorful",
    image: veg,
    alt: "Vegetable biryani served in a round bowl",
    objectPosition: "center top",
  },
  {
    name: "Paneer Tikka",
    price: "₹269",
    rating: "⭐ 4.8",
    badge: "Vegetarian Favorite",
    image: paneer,
    alt: "Paneer tikka skewers on a serving tray",
    objectPosition: "center center",
  },
];

const aboutHighlights = [
  "Fresh Ingredients",
  "Expert Chefs",
  "Family Friendly",
  "Fast Service",
];

const contactDetails = [
  {
    label: "Email",
    value: "sameedimad188@gmail.com",
    href: "mailto:sameedimad188@gmail.com",
  },
  {
    label: "Phone",
    value: "+91 9182351464",
    href: "tel:+919182351464",
  },
];

function Hero() {
  const [orderHint, setOrderHint] = useState("");
  const user = getUser();
  const isAdmin = user?.role === "admin";

  const handlePrimaryAction = () => {
    if (typeof window === "undefined") return;

    if (!isLoggedIn()) {
      setOrderHint("Please login to place your order.");
      return;
    }

    setOrderHint("");
    window.location.href = isAdmin ? "/admin" : "/menu";
  };

  return (
    <>
      <section className="hero" id="home">
        <div className="hero-inner">
          <div className="hero-copy">
            <p className="hero-kicker">Premium Indian dining</p>
            <h1 className="hero-title">
              Welcome to
              <br />
              <span className="navbar-brand-accent">R</span>oyal <span className="navbar-brand-accent">D</span>elight
            </h1>
            <h2 className="hero-sub">Where Every Meal is a Royal Experience.</h2>
            <div className="hero-actions">
              <button type="button" className="hero-primary-btn" onClick={handlePrimaryAction}>
                {isAdmin ? "Manage Orders" : "Order now"}
              </button>
            </div>
            {!isAdmin && orderHint ? (
              <p className="hero-order-hint" role="status" aria-live="polite">
                {orderHint}
              </p>
            ) : null}
          </div>

          <div className="hero-visual">
            <div className="hero-badge">
              <strong>100%</strong>
              <span>Quality Food</span>
            </div>

            <div className="hero-image-wrap">
              <img src={heroImage} alt="Biryani served in a large bowl" className="hero-image" />
            </div>
          </div>
        </div>
      </section>
      <section className="top-foods" id="menu" aria-labelledby="top-foods-title">
        <br />
        <br />
        <div className="top-foods-inner">
          <div className="top-foods-heading">
            <p className="top-foods-kicker">Top foods</p>
            <h2 className="top-foods-title" id="top-foods-title">
              Customer favorites from our kitchen
            </h2>
            <p className="top-foods-copy">
              Four popular dishes ready to jump straight into your order.
            </p>
          </div>
<br />
          <div className="top-foods-grid">
            {topFoods.map((food) => (
              <article className="food-card" key={food.name}>
                <span className="food-card-chip">{food.badge}</span>

                <div className="food-card-image-shell">
                  <img
                    className="food-card-image"
                    src={food.image}
                    alt={food.alt}
                    loading="lazy"
                    decoding="async"
                    style={{ objectPosition: food.objectPosition }}
                  />
                </div>

                <div className="food-card-body">
                  <div className="food-card-row">
                    <h3 className="food-card-name">{food.name}</h3>
                    <span className="food-card-rating">{food.rating}</span>
                  </div>
                  <p className="food-card-price">{food.price}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="about" id="about" aria-labelledby="about-title">
        <div className="about-inner">
          <div className="about-copy">
            <p className="section-kicker">About <span className="navbar-brand-accent">R</span>oyal <span className="navbar-brand-accent">D</span>elight</p>
            <h2 className="section-title" id="about-title">
              Authentic Indian Cuisine Since 2015
            </h2>
            <p className="section-copy">
              We believe every meal should be memorable.
              <br />
              From aromatic biryanis to rich curries,
              <br />
              our chefs prepare every dish with fresh
              <br />
              ingredients and authentic spices.
            </p>

            <div className="about-points" role="list" aria-label="Royal Delight highlights">
              {aboutHighlights.map((point) => (
                <div className="about-point" role="listitem" key={point}>
                  <span className="about-point-icon">✔</span>
                  <span className="about-point-text">{point}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="about-visual">
            <div className="about-image-frame">
              <img src={chicken} alt="Royal Delight biryani showcase" className="about-image" />
            </div>
            <div className="about-floating-card">
              <strong>Made for family tables</strong>
              <span>Rich flavors, warm service, and memorable meals.</span>
            </div>
          </div>
        </div>
      </section>

      <section className="contact" id="contact" aria-labelledby="contact-title">
        <div className="contact-inner">
          <div className="contact-copy">
            <p className="section-kicker">Contact us</p>
            <h2 className="section-title" id="contact-title">
              Let’s make your next meal special
            </h2>
            <p className="section-copy">
              Reach out for reservations, catering, or anything you need from Royal Delight.
            </p>
          </div>

          <div className="contact-grid">
            {contactDetails.map((detail) => (
              <a className="contact-card" href={detail.href} key={detail.label}>
                <span className="contact-card-label">{detail.label}</span>
                <span className="contact-card-value">{detail.value}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

<footer className="site-footer">
  <p className="site-footer-text">
    © 2026 Royal Delight. All Rights Reserved.
    <br />
    Designed & Developed with <span className="site-footer-heart">❤</span> by Sameed Imad
  </p>
</footer>
    </>
  );
}

export default Hero;
