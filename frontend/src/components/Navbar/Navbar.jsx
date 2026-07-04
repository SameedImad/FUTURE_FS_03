import "./Navbar.css";
import { clearSession, getUser } from "../../lib/session.js";

function Navbar({ variant = "landing" }) {
  const user = getUser();
  const userInitial = user?.name?.trim()?.charAt(0)?.toUpperCase() || user?.email?.trim()?.charAt(0)?.toUpperCase() || "U";
  const showAuthLogout = variant !== "landing" || Boolean(user);

  const links =
    variant === "admin"
      ? [{ label: "Manage Orders", href: "/admin#orders" }]
      : variant === "customer"
        ? [
            { label: "My Orders", href: "/dashboard" },
            { label: "View Cart", href: "/cart" },
          ]
        : [
            { label: "Home", href: "#home" },
            { label: "Top Foods", href: "#menu" },
            { label: "About Us", href: "#about" },
            { label: "Contact", href: "#contact" },
          ];

  const handleLogout = () => {
    clearSession();
    window.location.href = "/";
  };

  return (
    <header className="navbar-landing-page">
      <div className="navbar-inner">
        <a className="navbar-brand" href={variant === "admin" ? "/admin" : variant === "customer" ? "/menu" : "/"}>
          <span className="navbar-brand-accent">R</span>
          <span className="navbar-brand-plain">oyal</span>
          <span className="navbar-brand-accent">D</span>
          <span className="navbar-brand-plain">elight</span>
        </a>

        <nav className="navbar-links" aria-label="Primary">
          {links.map((link, index) => (
            <a
              className={variant === "landing" && index === 0 ? "is-active" : undefined}
              href={link.href}
              key={link.label}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="navbar-actions">
          {user ? (
            <span className="navbar-user-avatar" title={user.name || user.email || "User"} aria-label={user.name || user.email || "User"}>
              {userInitial}
            </span>
          ) : null}
          {showAuthLogout ? (
            <button className="navbar-logout-btn" type="button" onClick={handleLogout}>
              Logout
            </button>
          ) : (
            <a className="navbar-login-btn" href="/login">
              Login
            </a>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
