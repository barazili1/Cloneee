import { type ReactNode } from "react";

export function AccessGate({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function AccessDenied({
  reason,
}: {
  reason: "invalid" | "expired" | "device_limit";
}) {
  const title =
    reason === "expired"
      ? "انتهت صلاحية الرابط"
      : reason === "device_limit"
      ? "تم تجاوز عدد الأجهزة المسموح بها"
      : "الوصول مرفوض";
  const desc =
    reason === "expired"
      ? "الرابط ده مش شغّال دلوقتي، اطلب رابط جديد."
      : reason === "device_limit"
      ? "الرابط ده استخدمه أقصى عدد من الأجهزة."
      : "مش مسموحلك تدخل الصفحة دي بدون رابط صالح.";
  return (
    <div
      dir="rtl"
      className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-red-950 px-6"
    >
      <div className="max-w-sm rounded-3xl border border-white/10 bg-white/5 p-8 text-center shadow-2xl backdrop-blur">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/15 text-red-400">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M4.93 4.93l14.14 14.14" />
          </svg>
        </div>
        <h1 className="mt-5 text-xl font-bold text-white">{title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-white/70">{desc}</p>
      </div>
    </div>
  );
}
