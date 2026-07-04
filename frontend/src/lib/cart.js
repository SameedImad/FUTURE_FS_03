const CART_KEY = "royal-delight-cart";
const BUY_NOW_KEY = "royal-delight-buy-now";
const LAST_ORDER_KEY = "royal-delight-last-order";

function readStorage(key) {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(key);
}

function writeStorage(key, value) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, value);
}

export function getCartItems() {
  const rawItems = readStorage(CART_KEY);

  if (!rawItems) return [];

  try {
    return JSON.parse(rawItems);
  } catch {
    return [];
  }
}

export function addToCart(item) {
  const items = getCartItems();
  const existingItem = items.find((cartItem) => cartItem.id === item.id);

  if (existingItem) {
    const updatedItems = items.map((cartItem) =>
      cartItem.id === item.id
        ? { ...cartItem, quantity: (cartItem.quantity || 1) + 1 }
        : cartItem
    );
    writeStorage(CART_KEY, JSON.stringify(updatedItems));
    return;
  }

  writeStorage(
    CART_KEY,
    JSON.stringify([
      ...items,
      {
        ...item,
        quantity: 1,
      },
    ])
  );
}

export function removeFromCart(id) {
  const nextItems = getCartItems().filter((item) => item.id !== id);
  writeStorage(CART_KEY, JSON.stringify(nextItems));
}

export function clearCart() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(CART_KEY);
}

export function setBuyNowItem(item) {
  writeStorage(BUY_NOW_KEY, JSON.stringify(item));
}

export function getBuyNowItem() {
  const rawItem = readStorage(BUY_NOW_KEY);

  if (!rawItem) return null;

  try {
    return JSON.parse(rawItem);
  } catch {
    return null;
  }
}

export function clearBuyNowItem() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(BUY_NOW_KEY);
}

export function setLastOrder(order, user = null) {
  writeStorage(
    LAST_ORDER_KEY,
    JSON.stringify({
      order,
      userId: user?.id || "",
      userEmail: typeof user?.email === "string" ? user.email.toLowerCase() : "",
    })
  );
}

export function getLastOrderForUser(user = null) {
  const rawOrder = readStorage(LAST_ORDER_KEY);

  if (!rawOrder) return null;

  try {
    const parsed = JSON.parse(rawOrder);
    const currentUserId = user?.id || "";
    const currentUserEmail = typeof user?.email === "string" ? user.email.toLowerCase() : "";

    if (parsed?.userId && currentUserId && parsed.userId === currentUserId) {
      return parsed.order || null;
    }

    if (parsed?.userEmail && currentUserEmail && parsed.userEmail === currentUserEmail) {
      return parsed.order || null;
    }

    return null;
  } catch {
    return null;
  }
}

export function clearLastOrder() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(LAST_ORDER_KEY);
}
