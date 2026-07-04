const TOKEN_KEY = "royal-delight-token";
const USER_KEY = "royal-delight-user";
const EXPIRES_KEY = "royal-delight-expires-at";
const SESSION_TTL_MS = 3 * 24 * 60 * 60 * 1000;

function readSessionData() {
  if (typeof window === "undefined") return null;

  const token = window.localStorage.getItem(TOKEN_KEY);
  const rawUser = window.localStorage.getItem(USER_KEY);
  const expiresAt = Number(window.localStorage.getItem(EXPIRES_KEY) || "0");

  if (!token) return null;

  if (expiresAt && Date.now() > expiresAt) {
    clearSession();
    return null;
  }

  let user = null;
  if (rawUser) {
    try {
      user = JSON.parse(rawUser);
    } catch {
      user = null;
    }
  }

  return { token, user };
}

export function setSession({ token, user }) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(TOKEN_KEY, token);
  if (user) {
    window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
  window.localStorage.setItem(EXPIRES_KEY, String(Date.now() + SESSION_TTL_MS));
}

export function getToken() {
  return readSessionData()?.token || null;
}

export function getUser() {
  return readSessionData()?.user || null;
}

export function clearSession() {
  if (typeof window === "undefined") return;

  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
  window.localStorage.removeItem(EXPIRES_KEY);
}

export function isLoggedIn() {
  return Boolean(readSessionData()?.token);
}
