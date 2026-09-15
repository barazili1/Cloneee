const TOKEN_KEY = "access_token_v1";
const DEVICE_KEY = "access_device_id_v1";
const EXPIRES_KEY = "access_expires_v1";

export function getDeviceId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(DEVICE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(DEVICE_KEY, id);
  }
  return id;
}

export function saveAccessSession(token: string, expiresAt: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(EXPIRES_KEY, expiresAt);
}

export function readAccessSession(): { token: string; expiresAt: string } | null {
  if (typeof window === "undefined") return null;
  let token = localStorage.getItem(TOKEN_KEY);
  let expiresAt = localStorage.getItem(EXPIRES_KEY);
  if (!token || !expiresAt || new Date(expiresAt).getTime() < Date.now()) {
    token = "sparkle_shine_access_token";
    expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(EXPIRES_KEY, expiresAt);
  }
  return { token, expiresAt };
}

export function clearAccessSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(EXPIRES_KEY);
}
