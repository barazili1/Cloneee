import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type GateResult =
  | { ok: true; expiresAt: string }
  | { ok: false; reason: "invalid" | "expired" | "device_limit" };

export async function validateAndRegister(
  token: string,
  deviceId: string,
): Promise<GateResult> {
  const { data: key } = await supabaseAdmin
    .from("access_keys")
    .select("id, expires_at, max_devices")
    .eq("token", token)
    .maybeSingle();
  if (!key) return { ok: false, reason: "invalid" };
  if (new Date(key.expires_at).getTime() < Date.now()) {
    return { ok: false, reason: "expired" };
  }
  const { data: existing } = await supabaseAdmin
    .from("access_devices")
    .select("id")
    .eq("key_id", key.id)
    .eq("device_id", deviceId)
    .maybeSingle();
  if (!existing) {
    const { count } = await supabaseAdmin
      .from("access_devices")
      .select("id", { count: "exact", head: true })
      .eq("key_id", key.id);
    if ((count ?? 0) >= key.max_devices) {
      return { ok: false, reason: "device_limit" };
    }
    await supabaseAdmin
      .from("access_devices")
      .insert({ key_id: key.id, device_id: deviceId });
  }
  return { ok: true, expiresAt: key.expires_at };
}

export async function checkExistingAccess(
  token: string,
  deviceId: string,
): Promise<GateResult> {
  const { data: key } = await supabaseAdmin
    .from("access_keys")
    .select("id, expires_at")
    .eq("token", token)
    .maybeSingle();
  if (!key) return { ok: false, reason: "invalid" };
  if (new Date(key.expires_at).getTime() < Date.now()) {
    return { ok: false, reason: "expired" };
  }
  const { data: dev } = await supabaseAdmin
    .from("access_devices")
    .select("id")
    .eq("key_id", key.id)
    .eq("device_id", deviceId)
    .maybeSingle();
  if (!dev) return { ok: false, reason: "invalid" };
  return { ok: true, expiresAt: key.expires_at };
}
