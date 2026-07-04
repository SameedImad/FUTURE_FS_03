import LandingPage from "./pages/landing_page.jsx";
import LoginPage from "./pages/login.jsx";
import SignupPage from "./pages/signup.jsx";
import MenuPage from "./pages/menu.jsx";
import CartPage from "./pages/cart.jsx";
import BuyPage from "./pages/buy.jsx";
import DashboardPage from "./pages/dashboard.jsx";
import AdminPage from "./pages/admin.jsx";

function App() {
  const pathname = typeof window !== "undefined" ? window.location.pathname : "/";
  const isLoginPage = pathname.startsWith("/login");
  const isSignupPage = pathname.startsWith("/signup");
  const isMenuPage = pathname.startsWith("/menu");
  const isCartPage = pathname.startsWith("/cart");
  const isBuyPage = pathname.startsWith("/buy");
  const isDashboardPage = pathname.startsWith("/dashboard");
  const isAdminPage = pathname.startsWith("/admin");

  return (
    <>
      {isLoginPage ? (
        <LoginPage />
      ) : isSignupPage ? (
        <SignupPage />
      ) : isMenuPage ? (
        <MenuPage />
      ) : isCartPage ? (
        <CartPage />
      ) : isBuyPage ? (
        <BuyPage />
      ) : isAdminPage ? (
        <AdminPage />
      ) : isDashboardPage ? (
        <DashboardPage />
      ) : (
        <LandingPage />
      )}
    </>
  );
}

export default App;
