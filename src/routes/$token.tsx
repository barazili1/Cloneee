import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { validateAccessToken } from "@/lib/access-keys.functions";
import { getDeviceId, saveAccessSession } from "@/lib/access-session";
import { AccessDenied } from "@/components/access-gate";

export const Route = createFileRoute("/$token")({
  component: TokenGate,
});

function TokenGate() {
  const { token } = Route.useParams();
  const navigate = useNavigate();
  const validate = validateAccessToken;
  const [reason, setReason] = useState<"invalid" | "expired" | "device_limit" | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await validate({ data: { token, deviceId: getDeviceId() } });
        if (cancelled) return;
        if (res.ok) {
          saveAccessSession(token, res.expiresAt);
          navigate({ to: "/", replace: true });
        } else {
          setReason(res.reason);
        }
      } catch {
        if (!cancelled) setReason("invalid");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, validate, navigate]);

  if (reason) return <AccessDenied reason={reason} />;
  return <div className="min-h-screen bg-background" />;
}
