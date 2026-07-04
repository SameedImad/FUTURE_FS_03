import { useEffect, useState } from "react";
import "./login.css";
import GoogleIcon from "../icons/GoogleIcon.jsx";
import { apiRequest } from "../../lib/api.js";
import { isLoggedIn, setSession } from "../../lib/session.js";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../../firebase";

function Login() {
  const [errorMessage, setErrorMessage] = useState("");
  const [googleErrorMessage, setGoogleErrorMessage] = useState("");

  useEffect(() => {
    if (!isLoggedIn() || typeof window === "undefined") return;

    window.location.href = "/";
  }, []);

  const handleLogin = async (event) => {
    event.preventDefault();
    if (typeof window === "undefined") return;

    setErrorMessage("");
    const form = event.target;
    const payload = {
      email: form.email.value,
      password: form.password.value,
    };

    try {
      const data = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setSession({ token: data.token, user: data.user });
      window.location.href = "/";
    } catch (err) {
      console.error("Login error", err);
      setErrorMessage(err.message || "Login failed");
    }
  };

  if (isLoggedIn()) {
    return null;
  }

  const handleGoogleLogin = async () => {
    try {
      setGoogleErrorMessage("");
      const result = await signInWithPopup(auth, googleProvider);
      const googleUser = result.user;

      const response = await apiRequest("/auth/google", {
        method: "POST",
        body: JSON.stringify({
          mode: "login",
          name: googleUser.displayName,
          email: googleUser.email,
        }),
      });

      setSession({ token: response.token, user: response.user });
      window.location.href = "/";
    } catch (error) {
      if (error?.code === "auth/popup-closed-by-user" || error?.code === "auth/cancelled-popup-request") {
        return;
      }

      setGoogleErrorMessage(error?.message || "Google login failed");
    }
  };
  return (
    <section className="login-page" aria-labelledby="login-title">
      <div className="login-page-shell">
        <div className="login-brand-panel">
          <p className="login-brand">Royal Delight</p>
          <h1 className="login-hero-title" id="login-title">
            Welcome Back
          </h1>
          <p className="login-hero-copy">
            Sign in to continue your royal dining experience and manage your orders with ease.
          </p>

          <div className="login-note-card">
            <span className="login-note-label">Fast access</span>
            <strong>Fresh meals, saved preferences, and a smoother checkout.</strong>
          </div>
        </div>

        <div className="login-form-panel">
          <form className="login-form" onSubmit={handleLogin}>
            <label className="login-field-label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="login-input"
              placeholder="Enter your email"
              autoComplete="email"
            />

            <label className="login-field-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className="login-input"
              placeholder="Enter your password"
              autoComplete="current-password"
            />

            <button type="submit" className="login-submit-btn">
              Login
            </button>

            <div className="login-divider" aria-hidden="true">
              <span />
              <span className="login-divider-text">or</span>
              <span />
            </div>

            <button type="button" className="google-login-btn" onClick={handleGoogleLogin}>
              <span className="google-login-icon" aria-hidden="true">
                <GoogleIcon size={16} />
              </span>
              Continue with Google
            </button>

            {(errorMessage || googleErrorMessage) ? (
              <p className="login-google-message" role="alert" aria-live="polite">
                {googleErrorMessage || errorMessage}
              </p>
            ) : null}

            <p className="login-signup-text">
              Don't have an account?
              <a href="/signup">Create Account</a>
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}

export default Login;
