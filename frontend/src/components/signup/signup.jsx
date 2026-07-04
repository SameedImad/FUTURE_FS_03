import { useEffect, useState } from "react";
import "../login/login.css";
import GoogleIcon from "../icons/GoogleIcon.jsx";
import { apiRequest } from "../../lib/api.js";
import { clearCart } from "../../lib/cart.js";
import { isLoggedIn, setSession } from "../../lib/session.js";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../../firebase.js";
function Signup() {
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!isLoggedIn() || typeof window === "undefined") return;

    window.location.href = "/";
  }, []);

  if (isLoggedIn()) {
    return null;
  }

  const handleSignup = async (event) => {
    event.preventDefault();
    if (typeof window === "undefined") return;

    setErrorMessage("");
    const form = event.target;
    const confirmPassword = form.confirmPassword.value;
    const payload = {
      name: form.name.value,
      email: form.email.value,
      password: form.password.value,
    };

    if (payload.password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    try {
      const response = await apiRequest('/auth/signup', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      clearCart();
      setSession({ token: response.token, user: response.user });
      window.location.href = "/";
    } catch (err) {
      console.error('Signup error', err);
      setErrorMessage(err.message || 'Signup failed');
    }
  };

  const handleGoogleSignup = async () => {
    try {
      setErrorMessage("");
      const result = await signInWithPopup(auth, googleProvider);
      const googleUser = result.user;

      const response = await apiRequest("/auth/google", {
        method: "POST",
        body: JSON.stringify({
          mode: "signup",
          name: googleUser.displayName,
          email: googleUser.email,
        }),
      });

      clearCart();
      setSession({ token: response.token, user: response.user });
      window.location.href = "/";
    } catch (error) {
      console.log(error);
      // Firebase may throw a popup-related error even when the login completes.
      // Keep the UI quiet for Google auth so the successful sign-in can continue.
    }
  };

  return (
    <section className="login-page" aria-labelledby="signup-title">
      <div className="login-page-shell">
        <div className="login-brand-panel">
          <p className="login-brand">Royal Delight</p>
          <h1 className="login-hero-title" id="signup-title">
            Create Your Account
          </h1>
          <p className="login-hero-copy">
            Join Royal Delight to save your favorites, place faster orders, and enjoy a smoother dining experience.
          </p>

          <div className="login-note-card">
            <span className="login-note-label">Quick start</span>
            <strong>Set up your profile once and enjoy a quicker checkout every time.</strong>
          </div>
        </div>

        <div className="login-form-panel">
          <form className="login-form" onSubmit={handleSignup}>
            {errorMessage ? (
              <p className="login-form-message" role="alert" aria-live="polite">
                {errorMessage}
              </p>
            ) : null}

            <label className="login-field-label" htmlFor="fullName">
              Full Name
            </label>
            <input
              id="fullName"
              name="name"
              type="text"
              className="login-input"
              placeholder="Enter your full name"
              autoComplete="name"
            />

            <label className="login-field-label" htmlFor="signupEmail">
              Email
            </label>
            <input
              id="signupEmail"
              name="email"
              type="email"
              className="login-input"
              placeholder="Enter your email"
              autoComplete="email"
            />

            <label className="login-field-label" htmlFor="signupPassword">
              Password
            </label>
            <input
              id="signupPassword"
              name="password"
              type="password"
              className="login-input"
              placeholder="Create a password"
              autoComplete="new-password"
            />

            <label className="login-field-label" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              className="login-input"
              placeholder="Confirm your password"
              autoComplete="new-password"
            />

            <button type="submit" className="login-submit-btn">
              Create Account
            </button>

            <div className="login-divider" aria-hidden="true">
              <span />
              <span className="login-divider-text">or</span>
              <span />
            </div>

            <button type="button" className="google-login-btn" onClick={handleGoogleSignup}>
              <span className="google-login-icon" aria-hidden="true">
                <GoogleIcon size={16} />
              </span>
              Sign up with Google
            </button>

            <p className="login-signup-text">
              Already have an account?
              <a href="/login">Login</a>
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}

export default Signup;
