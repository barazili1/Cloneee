import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ChevronRight, Star, X } from "lucide-react";
import { useState, type SVGProps } from "react";
import loadingLogo from "@/assets/vodafone-loading-logo.png.asset.json";
import { AccessGate } from "@/components/access-gate";

export const Route = createFileRoute("/transfer")({
  head: () => ({
    meta: [
      { title: "تحويل أموال | محفظتي" },
      { name: "description", content: "حوّل الأموال إلى أي رقم موبايل بسهولة" },
      { property: "og:title", content: "تحويل أموال | محفظتي" },
      { property: "og:description", content: "حوّل الأموال إلى أي رقم موبايل بسهولة" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TransferPage,
});

function ContactBookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="3.5" y="3" width="15" height="18" rx="2" />
      <circle cx="10.5" cy="9.5" r="2.3" />
      <path d="M6.8 15.8c.55-2.2 2-3.3 3.7-3.3s3.15 1.1 3.7 3.3" />
      <path d="M18.5 6.5v2.4M18.5 11v2.4M18.5 15.5v2.4" />
      <path d="M18.5 3h1a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1h-1" />
    </svg>
  );
}

function FeesIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="12" x2="9" y2="12" />
      <line x1="16" y1="16" x2="9" y2="16" />
    </svg>
  );
}

const quickAmounts = [
  { value: 10, label: "١٠" },
  { value: 100, label: "١٠٠" },
  { value: 500, label: "٥٠٠" },
];

function TransferPage() {
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [feesOpen, setFeesOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const navigate = useNavigate();
  const showAmount = phone.length === 11;
  const canConfirm = showAmount && Number(amount) > 0;

  const confirmTransfer = () => {
    if (!canConfirm) return;
    setConfirmLoading(true);
    setTimeout(() => {
      setConfirmLoading(false);
      void navigate({ to: "/confirm", search: { amount: Number(amount), phone } });
    }, 1500);
  };

  const addAmount = (value: number) => {
    const current = amount === "" ? 0 : parseFloat(amount);
    setAmount(String(current + value));
  };

  const toArabicDigits = (s: string) => s.replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩".charAt(Number(d)));
  const toWesternDigits = (s: string) =>
    s.replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));

  return (
    <main dir="rtl" className="mx-auto flex h-dvh max-w-[430px] flex-col bg-[#f2f2f4] text-foreground shadow-2xl">
      {/* Header */}
      <header className="relative flex h-[58px] items-center justify-center bg-white">
        <h1 className="text-[20px] font-normal">تحويل أموال</h1>
        <Link
          to="/"
          aria-label="رجوع"
          className="absolute right-4 top-1/2 grid size-[46px] -translate-y-1/2 place-items-center rounded-full bg-white shadow-[0_1px_6px_rgba(0,0,0,0.12)]"
        >
          <ChevronRight size={26} strokeWidth={2.5} />
        </Link>
      </header>

      <div className="flex-1 px-4 pt-6">
        <h2 className="mb-3 px-1 text-[26px] font-normal">حول إلي</h2>

        {/* Phone field */}
        <div className="relative flex h-[58px] items-center rounded-[18px] border-2 border-[#bfbfbf] bg-white px-4 transition-colors focus-within:border-[#5aa8b5]">
          <label className="flex flex-1 flex-col justify-center">
            {phone.length > 0 && (
              <span className="text-[13px] text-foreground/50">رقم الموبايل</span>
            )}
            <input
              type="tel"
              inputMode="numeric"
              dir="rtl"
              value={phone}
              placeholder={phone.length === 0 ? "رقم الموبايل" : ""}
              onChange={(e) => setPhone(toWesternDigits(e.target.value).replace(/\D/g, "").slice(0, 11))}
              className={`bg-transparent leading-none outline-none placeholder:text-foreground/90 ${
                phone.length === 0
                  ? "text-[18px] font-normal placeholder:text-[18px] placeholder:font-normal"
                  : "text-[20px] font-normal tracking-wide"
              }`}
            />
          </label>
          {phone.length > 0 ? (
            <button
              type="button"
              aria-label="مسح الرقم"
              onClick={() => { setPhone(""); setAmount(""); }}
              className="grid size-[38px] shrink-0 place-items-center text-foreground/80"
            >
              <X size={26} strokeWidth={2.2} />
            </button>
          ) : (
            <ContactBookIcon className="size-[26px] shrink-0 text-[#e60000]" />
          )}
        </div>

        {/* Amount section */}
        {showAmount && (
          <div className="mt-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="mb-2.5 flex items-center justify-between px-1">
              <span className="text-[24px] font-normal">مبلغ</span>
              <button
                type="button"
                onClick={() => setFeesOpen(true)}
                className="flex items-center gap-1.5 text-[15px] font-normal text-foreground/50"
              >
                <FeesIcon className="size-[20px]" />
                الرسوم
              </button>
            </div>

            <div className="rounded-[18px] bg-white px-4 pb-5 pt-7">
              <div className="flex items-center justify-center gap-2 pb-5">
                <input
                  type="tel"
                  inputMode="numeric"
                  dir="rtl"
                  value={toArabicDigits(amount)}
                  placeholder="٠"
                  onChange={(e) => setAmount(toWesternDigits(e.target.value).replace(/\D/g, ""))}
                  style={{ width: `${Math.max(amount.length, 1) + 0.3}ch` }}
                  className="bg-transparent text-center text-[48px] font-bold leading-[1.05] text-[#2e8b9a] caret-[#2e8b9a] outline-none transition-[width] placeholder:text-[#2e8b9a]"
                  aria-label="المبلغ"
                />
                <span className="text-[34px] font-bold leading-[1.05]">جنيه</span>
              </div>

              <div className="flex justify-center gap-2.5 pb-3.5">
                {quickAmounts.map((chip) => (
                  <button
                    key={chip.value}
                    type="button"
                    onClick={() => addAmount(chip.value)}
                    className="flex h-[44px] items-center justify-center gap-1.5 rounded-full border border-foreground/25 bg-white px-4"
                  >
                    <span className="text-[18px] font-normal leading-none">+</span>
                    <span className="text-[15px] font-normal">جنيه</span>
                    <span className="text-[18px] font-normal leading-none">{chip.label}</span>
                  </button>
                ))}
              </div>

              <p className="text-center text-[13px] text-foreground/50">
                المبلغ المسموح به من ٥ جنيه إلى ٦٠٠٠٠ جنيه
              </p>
            </div>
          </div>
        )}

        {/* Favorites card */}
        {!showAmount && (
          <div className="mt-8 rounded-[20px] bg-white p-2.5">
            <div className="flex flex-col items-center rounded-[16px] bg-[#f2f2f4] px-6 py-8 text-center">
              <Star size={38} strokeWidth={1.5} className="mb-4" />
              <p className="text-[15px] font-medium leading-relaxed">
                زود أرقامك المفضلة هنا علشان تلاقيهم بسهولة !
              </p>
              <button type="button" className="mt-2 text-[17px] font-normal text-[#e60000]">
                زود رقم مفضل
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirm */}
      <div className="px-5 pb-9">
        <button
          type="button"
          disabled={!canConfirm}
          onClick={confirmTransfer}
          className={`h-[48px] w-full rounded-[14px] text-[17px] font-normal text-white transition-colors ${
            canConfirm ? "bg-[#e60000]" : "bg-[#e49a99]"
          }`}
        >
          تأكيد
        </button>
      </div>

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

      {feesOpen && <FeesSheet onClose={() => setFeesOpen(false)} />}
    </main>
  );
}

function FeesSheet({ onClose }: { onClose: () => void }) {
  const fees = [
    "تطبيق الشروط والأحكام على الهدايا.",
    "١ جنيه عند التحويل لمحفظة ڤودافون كاش.",
    "٥٠ ٪ من المبلغ بحد أدنى ١ جنيه وأقصى ١٥ جنيه عند التحويل، لمحفظة أخرى.",
    "رسوم أول عملية تحويل في الشهر ببلاش (للعمليات بقيمة أقل من ٢,٠٠٠ ج).",
  ];

  return (
    <div className="fixed inset-0 z-50 mx-auto flex max-w-[430px] flex-col justify-end">
      <button
        type="button"
        aria-label="إغلاق"
        className="absolute inset-0 h-full w-full cursor-default bg-black/55"
        onClick={onClose}
      />
      <div className="relative rounded-t-[28px] bg-white px-5 pb-8 pt-3">
        <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-foreground/20" />
        <div className="mb-6 flex items-center justify-between">
          <button
            type="button"
            aria-label="إغلاق"
            onClick={onClose}
            className="grid size-10 place-items-center"
          >
            <X size={26} strokeWidth={2.2} />
          </button>
          <h2 className="text-[20px] font-bold">رسوم التحويل</h2>
          <span className="size-10" />
        </div>
        <ul className="space-y-4" dir="rtl">
          {fees.map((text, i) => (
            <li key={i} className="flex items-start gap-3 text-right">
              <span className="mt-2 size-2 shrink-0 rounded-full bg-[#2e8b9a]" />
              <span className="text-[16px] leading-relaxed text-foreground/90">{text}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
