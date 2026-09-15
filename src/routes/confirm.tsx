import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

import cashLogo from "@/assets/kashla-logo.asset.json";
import cashWatermark from "@/assets/cash-watermark.png.asset.json";
import loadingLogo from "@/assets/vodafone-loading-logo.png.asset.json";
import { PinSheet } from "@/components/pin-sheet";
import { getSenderNameForPhone } from "@/lib/sender-names";
import { AccessGate } from "@/components/access-gate";

export const Route = createFileRoute("/confirm")({
  validateSearch: (search: Record<string, unknown>) => ({
    amount: Number(search["amount"]) || 0,
    phone: String(search["phone"] ?? ""),
  }),
  head: () => ({
    meta: [
      { title: "تأكيد التحويل | محفظتي" },
      { name: "description", content: "راجع تفاصيل التحويل قبل التأكيد" },
      { property: "og:title", content: "تأكيد التحويل | محفظتي" },
      { property: "og:description", content: "راجع تفاصيل التحويل قبل التأكيد" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ConfirmPage,
});

function ConfirmPage() {
  const { amount, phone } = Route.useSearch();
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [pinOpen, setPinOpen] = useState(false);
  const senderName = useMemo(() => getSenderNameForPhone(phone), [phone]);
  const total = amount.toFixed(1);

  const handleConfirm = () => {
    if (confirmLoading || pinOpen) return;
    setConfirmLoading(true);
    setTimeout(() => {
      setConfirmLoading(false);
      setPinOpen(true);
    }, 1500);
  };

  const handlePinComplete = () => {
    setPinOpen(false);
    setConfirmLoading(true);
    setTimeout(() => {
      setConfirmLoading(false);
      void navigate({
        to: "/success",
        search: { amount, phone, senderName },
      });
    }, 3000 + Math.random() * 2000);
  };

  return (
    <main dir="rtl" className="mx-auto flex h-dvh max-w-[430px] flex-col overflow-hidden bg-[#f2f2f4] text-foreground shadow-2xl">
      {/* Header */}
      <header className="relative flex h-[52px] shrink-0 items-center justify-center bg-white">
        <h1 className="text-[20px] font-normal">تأكيد</h1>
        <Link
          to="/transfer"
          aria-label="رجوع"
          className="absolute right-4 top-1/2 grid size-[46px] -translate-y-1/2 place-items-center rounded-full bg-white shadow-[0_1px_6px_rgba(0,0,0,0.12)]"
        >
          <ChevronRight size={26} strokeWidth={2.5} />
        </Link>
      </header>

      <div className="flex min-h-0 flex-1 flex-col px-4">
        {/* Amount */}
        <div className="mt-[27px] flex items-baseline justify-center gap-2">
          <span className="text-[40px] font-bold leading-none text-[#2e8b9a]">{amount}</span>
          <span className="text-[28px] font-bold leading-none">جنيه</span>
        </div>
        <p className="mt-1 text-center text-[14px] text-foreground/45">مبلغ التحويل</p>

        {/* From / To card */}
        <div className="relative mt-4 overflow-hidden rounded-[18px] bg-white px-4">
          <img
            src={cashWatermark.url}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 h-[220px] w-auto -translate-x-1/2 -translate-y-1/2 object-contain opacity-[0.08]"
          />
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
              <p className="mt-1 text-[16px] font-bold tracking-wide" dir="ltr">01087163221</p>
            </div>
          </div>
          <div className="relative h-px bg-foreground/10" />
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
              <p className="mt-1 text-right text-[16px] font-bold tracking-wide" dir="ltr">{phone || "01087163221"}</p>
              <p className="mt-1 text-left text-[14px] text-foreground/60" dir="ltr">{senderName}</p>
            </div>
          </div>
        </div>

        {/* Fees card */}
        <div className="mt-3 rounded-[18px] bg-white px-4">
          <div className="flex items-center justify-between py-2.5">
            <span className="text-[15px]">الرسوم</span>
            <span className="text-[15px] font-bold">0.0 جنيه</span>
          </div>
          <div className="flex items-center justify-between pb-2.5">
            <span className="text-[15px]">المبلغ الكلي المستحق</span>
            <span className="text-[15px] font-bold">{total} جنيه</span>
          </div>
        </div>

        {/* Greeting card */}
        <div className="mt-3 flex items-center justify-between rounded-[18px] bg-white px-4 py-2.5">
          <div className="flex items-center gap-3">
            <button
              type="button"
              role="switch"
              aria-checked={greeting}
              aria-label="اضف كارت معايدة"
              onClick={() => setGreeting((v) => !v)}
              className={`relative h-[30px] w-[52px] rounded-full transition-colors ${greeting ? "bg-[#e60000]" : "bg-[#c7c7cc]"}`}
            >
              <span
                className={`absolute top-[3px] size-[24px] rounded-full bg-white shadow transition-all ${greeting ? "left-[25px]" : "left-[3px]"}`}
              />
            </button>
            <span className="text-[15px]">اضف كارت معايدة؟</span>
          </div>
          <img
            src="/images/greeting-stamps.png"
            alt="كروت معايدة"
            width={180}
            height={73}
            className="h-[52px] w-auto object-contain"
          />
        </div>

        <p className="mt-2 text-[12px] text-foreground/45">* لمستخدمين فودافون كاش فقط</p>
        <p className="mt-1 text-[12px] leading-relaxed text-foreground/70">
          تأكد من ادخال الرقم الصحيح وفي حالة التحويل الخاطئ لن تتمكن من اعادة المبلغ مرة اخرى.
        </p>
        <div className="flex-1" />
      </div>

      {/* Confirm */}
      <div className="mb-5 shrink-0 px-5 pb-3 pt-2">
        <button
          type="button"
          disabled={confirmLoading}
          onClick={handleConfirm}
          className="h-[52px] w-full rounded-[14px] bg-[#e60000] text-[16px] font-normal text-white transition-transform active:scale-[0.98] disabled:opacity-60"
        >
          تأكيد
        </button>
      </div>

      {pinOpen && (
        <PinSheet onClose={() => setPinOpen(false)} onComplete={handlePinComplete} />
      )}

      {confirmLoading && (
        <div className="fixed inset-0 z-40 mx-auto flex max-w-[430px] flex-col items-center justify-center bg-[#7a7a7a]/90">
          <img
            src={loadingLogo.url}
            alt="جاري التحميل"
            width={80}
            height={80}
            className="loading-beat size-[72px] rounded-full object-cover"
          />
          <p className="mt-6 text-[20px] font-medium text-white">جاري التحميل</p>
        </div>
      )}
    </main>
  );
}
