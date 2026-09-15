import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, ChevronRight, MessageCircle, Share2, User } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import cashLogo from "@/assets/kashla-logo.asset.json";
import vodafoneCashCombo from "@/assets/vodafone-cash-combo.png.asset.json";

import pageEnterSound from "@/assets/success-page-enter.mp3.asset.json";
import notificationSound from "@/assets/iphone-notification.m4a.asset.json";
import { addTransfer } from "@/lib/transfer-history";
import { AccessGate } from "@/components/access-gate";

export const Route = createFileRoute("/success")({
  validateSearch: (search: Record<string, unknown>) => ({
    amount: Number(search["amount"]) || 0,
    phone: String(search["phone"] ?? ""),
    senderName: String(search["senderName"] ?? ""),
  }),
  head: () => ({
    meta: [
      { title: "تم التحويل بنجاح | محفظتي" },
      { name: "description", content: "تمت عملية التحويل بنجاح" },
      { property: "og:title", content: "تم التحويل بنجاح | محفظتي" },
      { property: "og:description", content: "تمت عملية التحويل بنجاح" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SuccessPage,
});

const arabicMonths = [
  "يناير",
  "فبراير",
  "مارس",
  "أبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
];

/** Scalloped badge-style green success icon */
function ScallopBadge({ size = 80 }: { size?: number }) {
  const cx = 50;
  const cy = 50;
  const r = 42;
  const n = 14;
  const depth = 3.5;
  const rOut = r + depth;
  const parts: string[] = [];
  for (let i = 0; i < n; i++) {
    const a1 = (i / n) * 2 * Math.PI;
    const a2 = ((i + 0.5) / n) * 2 * Math.PI;
    const a3 = ((i + 1) / n) * 2 * Math.PI;
    if (i === 0) {
      parts.push(
        `M ${(cx + r * Math.cos(a1)).toFixed(2)} ${(cy + r * Math.sin(a1)).toFixed(2)}`,
      );
    }
    parts.push(
      `Q ${(cx + rOut * Math.cos(a2)).toFixed(2)} ${(cy + rOut * Math.sin(a2)).toFixed(2)} ${(cx + r * Math.cos(a3)).toFixed(2)} ${(cy + r * Math.sin(a3)).toFixed(2)}`,
    );
  }
  parts.push("Z");
  const d = parts.join(" ");
  return (
    <svg viewBox="0 0 100 100" width={size} height={size}>
      <path d={d} fill="#34B561" />
      <path
        d="M 36 50 L 45 59 L 64 39"
        stroke="white"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}


function SuccessPage() {
  const { amount, phone, senderName } = Route.useSearch();
  const [dateParts, setDateParts] = useState<{
    day: string;
    month: string;
    year: string;
    time: string;
  } | null>(null);
  // Deterministic reference number (stable across SSR/client hydration)
  const txNumber = useMemo(() => {
    const seed = `${amount}|${phone}|${senderName}`;
    let h = 5381;
    for (let i = 0; i < seed.length; i++) {
      h = (h * 33) ^ seed.charCodeAt(i);
    }
    return String(100000000000 + (Math.abs(h) % 900000000000));
  }, [amount, phone, senderName]);

  useEffect(() => {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, "0");
    const m = String(now.getMinutes()).padStart(2, "0");
    setDateParts({
      day: String(now.getDate()),
      month: arabicMonths[now.getMonth()] ?? "",
      year: String(now.getFullYear()),
      time: `${h}:${m}`,
    });
  }, []);

  const saved = useRef(false);
  useEffect(() => {
    if (saved.current || amount <= 0) return;
    saved.current = true;
    addTransfer(amount, phone, senderName);
  }, [amount, phone, senderName]);

  // Page-enter sound plays immediately; notification slides in after 4s with its own sound
  const [showNotif, setShowNotif] = useState(false);
  const pageEnterAudioRef = useRef<HTMLAudioElement | null>(null);
  const notificationAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const pageEnterAudio = pageEnterAudioRef.current;
    if (pageEnterAudio) {
      pageEnterAudio.currentTime = 0;
      pageEnterAudio.play().catch(() => {});
    }
    const inTimer = setTimeout(() => setShowNotif(true), 4000);
    const outTimer = setTimeout(() => setShowNotif(false), 8000);
    return () => {
      clearTimeout(inTimer);
      clearTimeout(outTimer);
    };
  }, []);

  useEffect(() => {
    if (showNotif) {
      const notificationAudio = notificationAudioRef.current;
      if (notificationAudio) {
        notificationAudio.currentTime = 0;
        notificationAudio.play().catch(() => {});
      }
    }
  }, [showNotif]);

  return (
    <main
      dir="rtl"
      className="mx-auto flex min-h-dvh max-w-[430px] flex-col bg-[#F8F9FA] text-foreground shadow-2xl"
    >
      {/* iOS-style push notification */}
      <audio ref={pageEnterAudioRef} src={pageEnterSound.url} preload="auto" />
      <audio ref={notificationAudioRef} src={notificationSound.url} preload="auto" />
      <div className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-2">
        <div
          dir="rtl"
          className="flex w-full max-w-[400px] items-start gap-3 rounded-[22px] bg-[#3a3a3e]/70 px-4 py-3 shadow-[0_4px_18px_rgba(0,0,0,0.25)] backdrop-blur-xl transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform"
          style={{
            transform: showNotif ? "translateY(0)" : "translateY(-160%)",
            fontFamily:
              '-apple-system, "SF Arabic", "SF Pro Arabic", system-ui, "Tajawal", sans-serif',
          }}
        >
          {/* Avatar + Messages badge (far right) */}
          <div className="relative shrink-0 pt-0.5">
            <div
              className="grid size-[42px] place-items-center rounded-full"
              style={{
                background:
                  "linear-gradient(135deg, #B6C0E4 0%, #9BAAD3 100%)",
              }}
            >
              <User className="size-[24px] text-white" fill="white" strokeWidth={1} />
            </div>
            <div className="absolute -bottom-1.5 left-0 grid size-[20px] place-items-center rounded-[6px] bg-[#34C759] shadow-sm">
              <MessageCircle className="size-[12px] text-white" fill="white" strokeWidth={1.5} />
            </div>
          </div>
          {/* Text column */}
          <div className="min-w-0 flex-1 text-right">
            <div className="flex items-center justify-between">
              <span className="text-[14px] font-bold leading-none text-white">
                VF-Cash
              </span>
              <span className="text-[12px] leading-none text-white/60">الآن</span>
            </div>
            <p className="mt-1.5 text-[13px] leading-[1.35] text-white">
              تم تحويل {amount} جنيه لرقم {phone || "01151146419"} مصاريف
            </p>
            <p className="mt-0.5 text-[13px] leading-[1.35] text-white/85 truncate">
              الخدمة 0 جنيه رصيد حسابك فى فودافون كاش الح...
            </p>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="relative flex h-[52px] shrink-0 items-center justify-center bg-white">
        <h1 className="text-[20px] font-bold">تم بنجاح</h1>
        <Link
          to="/"
          aria-label="رجوع"
          className="absolute right-4 top-1/2 grid size-[46px] -translate-y-1/2 place-items-center rounded-full bg-white shadow-[0_1px_6px_rgba(0,0,0,0.12)]"
        >
          <ChevronRight size={26} strokeWidth={2.5} />
        </Link>
      </header>

      <div className="flex min-h-0 flex-1 flex-col px-4">
        {/* Success icon */}
        <div className="mt-6 flex justify-center">
          <ScallopBadge size={80} />
        </div>
        <p className="mt-3 text-center text-[16px] font-normal text-foreground/55">
          تم التحويل بنجاح
        </p>

        {/* Amount */}
        <div className="mt-4 flex items-baseline justify-center gap-2">
          <span className="text-[40px] font-bold leading-none text-[#197897]">
            {amount}
          </span>
          <span className="text-[28px] font-bold leading-none">جنيه</span>
        </div>
        <p className="mt-1 text-center text-[14px] text-foreground/45">
          مبلغ التحويل
        </p>

        {/* From card */}
        <div className="relative mt-4 overflow-hidden rounded-[18px] bg-white px-4 shadow-sm">
          <div className="relative flex items-center justify-start gap-3 py-2.5">
            <img
              src={cashLogo.url}
              alt="كاشلا"
              width={68}
              height={100}
              className="h-[68px] w-auto object-contain"
            />
            <div className="text-right">
              <p className="text-[13px] text-foreground/45">من</p>
              <p
                className="mt-1 text-[16px] font-bold tracking-wide"
                dir="ltr"
              >
                01087163221
              </p>
            </div>
          </div>
        </div>

        {/* To card */}
        <div className="relative mt-3 overflow-hidden rounded-[18px] bg-white px-4 shadow-sm">
          <div className="relative flex items-center justify-start gap-3 py-2.5">
            <img
              src={cashLogo.url}
              alt="كاشلا"
              width={68}
              height={100}
              className="h-[68px] w-auto object-contain"
            />
            <div className="text-right">
              <p className="text-[13px] text-foreground/45">إلى</p>
              <p
                className="mt-1 text-right text-[16px] font-bold tracking-wide"
                dir="ltr"
              >
                {phone || "01087163221"}
              </p>
              <p
                className="mt-1 text-left text-[14px] text-foreground/60"
                dir="ltr"
              >
                {senderName}
              </p>
            </div>
          </div>
        </div>

        {/* Fees card */}
        <div className="mt-3 rounded-[18px] bg-white px-4 shadow-sm">
          <div className="flex items-center justify-between py-2.5">
            <span className="text-[15px]">الرسوم</span>
            <span className="text-[15px] font-bold">0 جنيه</span>
          </div>
          <div className="flex items-center justify-between pb-2.5">
            <span className="text-[15px]">المبلغ الكلي المستحق</span>
            <span className="text-[15px] font-bold">{amount} جنيه</span>
          </div>
        </div>

        {/* Transaction info card */}
        <div className="mt-3 rounded-[18px] bg-white px-4 shadow-sm">
          <div className="flex items-center justify-between py-2.5">
            <span className="text-[15px]">تاريخ العملية</span>
            <span className="text-[15px] font-bold" dir="rtl">
              {dateParts ? (
                <>
                  <span>{dateParts.day}</span>{" "}
                  <span>{dateParts.month}</span>{" "}
                  <span>{dateParts.year}</span>{" "}
                  <span>{dateParts.time}</span>
                </>
              ) : (
                "—"
              )}
            </span>
          </div>
          <div className="flex items-center justify-between pb-2.5">
            <span className="text-[15px]">رقم العملية</span>
            <span className="text-[15px] font-bold" dir="ltr">
              {txNumber}
            </span>
          </div>
        </div>

      </div>


      {/* Footer logos + buttons */}
      <div className="mb-4 shrink-0 px-5 pb-3 pt-2">
        <div className="mb-3 flex items-center justify-center">
          <img
            src={vodafoneCashCombo.url}
            alt="فودافون كاش"
            className="h-[56px] w-auto object-contain"
          />
        </div>
        <div className="flex gap-2.5">
          <button
            type="button"
            className="flex h-[52px] flex-1 items-center justify-center gap-2 rounded-[14px] bg-[#e60000] text-[16px] font-normal text-white transition-transform active:scale-[0.98]"
          >
            <Share2 size={20} className="text-white" />
            شارك
          </button>
          <Link
            to="/"
            className="flex h-[52px] flex-1 items-center justify-center gap-2 rounded-[14px] border border-foreground/80 bg-white text-[16px] font-normal text-foreground transition-transform active:scale-[0.98]"
          >
            <Check size={20} strokeWidth={2.5} />
            تم
          </Link>
        </div>
      </div>
    </main>
  );
}
