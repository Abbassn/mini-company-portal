const TOKEN_KEY = "mini_company_portal_token";
const USER_KEY = "mini_company_portal_user";

export function saveAuthData(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser() {
  const storedUser = localStorage.getItem(USER_KEY);

  if (!storedUser) {
    return null;
  }

  return JSON.parse(storedUser);
}

export function clearAuthData() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isAuthenticated() {
  const token = getToken();

  if (!token) {
    return false;
  }

  try {
    const payloadBase64 = token.split(".")[1];
    const payload = JSON.parse(atob(payloadBase64));
    const currentTimeInSeconds = Date.now() / 1000;

    if (payload.exp && payload.exp < currentTimeInSeconds) {
      clearAuthData();
      return false;
    }

    return true;
  } catch {
    clearAuthData();
    return false;
  }
}