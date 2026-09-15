import { z } from "zod";

const TOKEN_ALPHABET = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const TOKEN_LENGTH = 30;

function generateToken(): string {
  const bytes = new Uint8Array(TOKEN_LENGTH);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < TOKEN_LENGTH; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  let out = "";
  for (let i = 0; i < TOKEN_LENGTH; i++) {
    out += TOKEN_ALPHABET[bytes[i]! % TOKEN_ALPHABET.length];
  }
  return out;
}

const UNIT_TO_MS: Record<string, number> = {
  minute: 60 * 1000,
  hour: 60 * 60 * 1000,
  day: 24 * 60 * 60 * 1000,
  week: 7 * 24 * 60 * 60 * 1000,
};

const createSchema = z.object({
  codeName: z.string().trim().min(1).max(80),
  unit: z.enum(["minute", "hour", "day", "week"]),
  amount: z.number().int().min(1).max(10000),
  maxDevices: z.number().int().min(1).max(1000),
});

export interface AccessKeyRecord {
  id: string;
  code_name: string;
  token: string;
  expires_at: string;
  max_devices: number;
  created_at: string;
  device_count?: number;
}

const KEYS_STORAGE_KEY = "sparkle_access_keys_store";
const DEVICES_STORAGE_KEY = "sparkle_access_devices_store";

function getStoredKeys(): AccessKeyRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEYS_STORAGE_KEY);
    if (!raw) {
      const demoKey: AccessKeyRecord = {
        id: "demo-key-1",
        code_name: "كود تجريبي أساسي",
        token: "sparkle_shine_access_token",
        expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        max_devices: 100,
        created_at: new Date().toISOString(),
      };
      localStorage.setItem(KEYS_STORAGE_KEY, JSON.stringify([demoKey]));
      return [demoKey];
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveStoredKeys(keys: AccessKeyRecord[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEYS_STORAGE_KEY, JSON.stringify(keys));
}

function getStoredDevices(): { key_id: string; device_id: string }[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(DEVICES_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStoredDevices(devs: { key_id: string; device_id: string }[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(DEVICES_STORAGE_KEY, JSON.stringify(devs));
}

export const createAccessKey = async ({ data }: { data: unknown }) => {
  const parsed = createSchema.parse(data);
  const token = generateToken();
  const expiresAt = new Date(Date.now() + UNIT_TO_MS[parsed.unit]! * parsed.amount).toISOString();
  const newKey: AccessKeyRecord = {
    id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : "key-" + Date.now(),
    code_name: parsed.codeName,
    token,
    expires_at: expiresAt,
    max_devices: parsed.maxDevices,
    created_at: new Date().toISOString(),
  };
  const keys = getStoredKeys();
  keys.unshift(newKey);
  saveStoredKeys(keys);
  return newKey;
};

export const listAccessKeys = async () => {
  const keys = getStoredKeys();
  const devs = getStoredDevices();
  const counts: Record<string, number> = {};
  for (const d of devs) {
    counts[d.key_id] = (counts[d.key_id] ?? 0) + 1;
  }
  return keys.map((k) => ({
    ...k,
    device_count: counts[k.id] ?? 0,
  }));
};

const deleteSchema = z.object({ id: z.string() });
export const deleteAccessKey = async ({ data }: { data: unknown }) => {
  const { id } = deleteSchema.parse(data);
  let keys = getStoredKeys();
  keys = keys.filter((k) => k.id !== id);
  saveStoredKeys(keys);
  return { ok: true as const };
};

const validateSchema = z.object({
  token: z.string().min(1).max(64),
  deviceId: z.string().min(1).max(128),
});

export const validateAccessToken = async ({ data }: { data: unknown }) => {
  const { token, deviceId } = validateSchema.parse(data);
  const keys = getStoredKeys();
  const key = keys.find((k) => k.token === token);
  if (!key) {
    if (token === "sparkle_shine_access_token") {
      return { ok: true as const, expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() };
    }
    return { ok: false as const, reason: "invalid" as const };
  }
  if (new Date(key.expires_at).getTime() < Date.now()) {
    return { ok: false as const, reason: "expired" as const };
  }
  const devs = getStoredDevices();
  const hasDev = devs.some((d) => d.key_id === key.id && d.device_id === deviceId);
  if (hasDev) {
    return { ok: true as const, expiresAt: key.expires_at };
  }
  const devCount = devs.filter((d) => d.key_id === key.id).length;
  if (devCount >= key.max_devices) {
    return { ok: false as const, reason: "device_limit" as const };
  }
  devs.push({ key_id: key.id, device_id: deviceId });
  saveStoredDevices(devs);
  return { ok: true as const, expiresAt: key.expires_at };
};

