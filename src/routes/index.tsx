import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowUpRight, Bell, ChevronLeft, CreditCard, Eye, EyeOff, Fingerprint, Gift, HelpCircle, Lock, Send, Store, X } from "lucide-react";
import { type SVGProps, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import electricSahlIcon from "@/assets/icon-electric-sahl.asset.json";
import electricIcon from "@/assets/icon-electric.asset.json";
import gasNewIcon from "@/assets/icon-gas-new.asset.json";
import gasIcon from "@/assets/icon-gas.asset.json";
import offerBanner from "@/assets/offer-banner.jpg";
import prosecutionIcon from "@/assets/icon-prosecution.asset.json";
import { PinSheet } from "@/components/pin-sheet";
import walletNavIcon from "@/assets/wallet-nav-icon.png.asset.json";
import loadingLogo from "@/assets/vodafone-loading-logo.png.asset.json";
import { getTransfers, formatArabicNumber, formatArabicDate, type TransferRecord } from "@/lib/transfer-history";
import { AccessGate } from "@/components/access-gate";

// No head() here: the home route inherits title/description/og/twitter from
// __root.tsx, and ships no og:image so serve-time hosting can inject the
// project's social preview (explicit og:image or latest screenshot).
export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "محفظتي | خدماتك المالية" },
      { name: "description", content: "حوّل الأموال وادفع فواتيرك من مكان واحد" },
      { property: "og:title", content: "محفظتي | خدماتك المالية" },
      { property: "og:description", content: "حوّل الأموال وادفع فواتيرك من مكان واحد" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type IconProps = SVGProps<SVGSVGElement>;

const iconDefaults = {
  viewBox: "0 0 48 48",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.4,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function TransferIcon(props: IconProps) {
  return (
    <svg {...iconDefaults} {...props}>
      <path d="M6 16h31m0 0-7-7m7 7-7 7M42 32H11m0 0 7-7m-7 7 7 7" />
    </svg>
  );
}

function DepositIcon(props: IconProps) {
  return (
    <svg {...iconDefaults} {...props}>
      <path d="M24 7v34M7 24h34" />
    </svg>
  );
}

function AtmIcon(props: IconProps) {
  return (
    <svg {...iconDefaults} {...props}>
      <rect x="7" y="8" width="34" height="22" rx="2" />
      <path d="M12 14h3m18 0h3M19 36v7m0 0-4-4m4 4 4-4M31 43v-7m0 0-4 4m4-4 4 4" />
      <circle cx="24" cy="19" r="4" />
    </svg>
  );
}

function PhoneIcon(props: IconProps) {
  return (
    <svg {...iconDefaults} {...props}>
      <path d="M15 6 8 10c-2 15 10 29 26 31l7-7-10-7-5 5c-6-3-10-7-12-13l6-4-5-9Z" />
    </svg>
  );
}

function EyeIcon(props: IconProps) {
  return (
    <svg {...iconDefaults} {...props}>
      <path d="M4 24s8-12 20-12 20 12 20 12-8 12-20 12S4 24 4 24Z" />
      <circle cx="24" cy="24" r="6" />
    </svg>
  );
}

function ScanIcon(props: IconProps) {
  return (
    <svg {...iconDefaults} {...props}>
      <path d="M8 18V9h9M31 9h9v9M40 30v9h-9M17 39H8v-9" />
      <rect x="17" y="17" width="5" height="5" rx="1" />
      <rect x="27" y="17" width="5" height="5" rx="1" />
      <rect x="17" y="27" width="5" height="5" rx="1" />
      <path d="M28 28h4v4h-4" />
    </svg>
  );
}

function ServicesIcon(props: IconProps) {
  return (
    <svg {...iconDefaults} {...props}>
      <rect x="6" y="6" width="16" height="16" rx="2" />
      <rect x="26" y="6" width="16" height="16" rx="2" />
      <rect x="6" y="26" width="16" height="16" rx="2" />
      <rect x="26" y="26" width="16" height="16" rx="2" />
      <path d="M14 10v8m-4-4h8M30 14h8M10 34h8m-4-4v8M31 31l6 6m0-6-6 6" />
    </svg>
  );
}


const shortcuts = [
  {
    label: (
      <>
        تحويل
        <br />
        الأموال
      </>
    ),
    icon: TransferIcon,
  },
  {
    label: (
      <>
        إيداع
        <br />
        الأموال
      </>
    ),
    icon: DepositIcon,
  },
  {
    label: (
      <>
        عمليات
        <br />
        ATM
      </>
    ),
    icon: AtmIcon,
  },
  {
    label: (
      <>
        خدمات
        <br />
        الاتصالات
      </>
    ),
    icon: PhoneIcon,
  },
];

const services = [
  { label: "النيابة العامة", img: prosecutionIcon.url },
  { label: "كارت الكهرباء", img: electricSahlIcon.url },
  { label: "كارت الغاز", img: gasNewIcon.url },
  { label: "كهرباء", img: electricIcon.url },
  { label: "غاز", img: gasIcon.url },
];

function Index() {
  const [toastVisible, setToastVisible] = useState(true);
  const [balanceVisible, setBalanceVisible] = useState(false);
  const [pinOpen, setPinOpen] = useState(false);
  const [transferLoading, setTransferLoading] = useState(false);
  const navigate = useNavigate();

  const [transfers, setTransfers] = useState<TransferRecord[]>([]);
  useEffect(() => {
    setTransfers(getTransfers());
  }, []);
  const totalTransferred = transfers.reduce((s, t) => s + t.amount, 0);
  const balance = 70000 - totalTransferred;
  const expenses = 7314.7 + totalTransferred;

  const goToTransfer = () => {
    setTransferLoading(true);
    setTimeout(() => {
      setTransferLoading(false);
      void navigate({ to: "/transfer" });
    }, 1500);
  };

  return (
    <main
      dir="rtl"
      className="mx-auto min-h-dvh max-w-[430px] overflow-x-hidden bg-background pb-[66px] text-foreground shadow-2xl"
    >
      <section className="wallet-backdrop relative h-[310px] px-[22px] pt-[12px] text-primary-foreground">
        <div className="flex items-center justify-between">
          <div className="flex h-[40px] items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-3 text-[17px] font-bold">
            <ChevronLeft size={27} strokeWidth={3} />
            <span>فودافون كاش</span>
          </div>
          <div className="flex h-[40px] items-center rounded-full border border-primary-foreground/20 bg-primary-foreground/10 p-1">
            <Button
              variant="ghost"
              aria-label="الإشعارات"
              className="grid size-8 place-items-center rounded-full bg-primary-foreground/10"
            >
              <Bell size={18} />
            </Button>
            <Button
              variant="ghost"
              aria-label="الهدايا"
              className="grid size-8 place-items-center rounded-full bg-primary-foreground/10"
            >
              <Gift size={18} />
            </Button>
          </div>
        </div>

        <div className="mt-[10px] flex items-center justify-between">
          <p className="text-[18px]">
            أهلاً، <strong className="font-extrabold">كريم</strong>
          </p>
          <div className="flex items-center gap-1.5 rounded-full bg-primary-foreground/20 px-3 py-1 text-[12px]">
            <span>
              المحفظة: <strong>مفعل</strong>
            </span>
            <span className="size-2.5 rounded-full bg-green-500 ring-2 ring-primary-foreground" />
          </div>
        </div>

        <div className="mt-[10px] overflow-hidden rounded-[12px] border border-primary-foreground/30 backdrop-blur-[2px]">
          <div className="flex h-[58px] items-center justify-between px-6">
            <span
              className={
                balanceVisible
                  ? "text-[20px] font-bold"
                  : "text-[20px] font-bold blur-[7px] select-none"
              }
            >
              {formatArabicNumber(balance)} ج.م
            </span>
            <div className="flex items-center gap-6">
              <Button
                variant="ghost"
                aria-label={balanceVisible ? "إخفاء الرصيد" : "إظهار الرصيد"}
                onClick={() => {
                  if (balanceVisible) {
                    setBalanceVisible(false);
                  } else {
                    setPinOpen(true);
                  }
                }}
              >
                {balanceVisible ? <Eye className="size-6" /> : <EyeOff className="size-6" />}
              </Button>
              <span className="h-7 w-px bg-primary-foreground/30" />
              <Button variant="ghost" aria-label="مسح رمز">
                <ScanIcon className="size-8" />
              </Button>
            </div>
          </div>
          <Button
            variant="ghost"
            className="h-[31px] w-full rounded-none border-t border-primary-foreground/25 text-[13px]"
          >
            عرض مصروفاتك
          </Button>
        </div>

        <div className="mt-[11px] flex justify-center gap-2 px-6" dir="rtl">
          {shortcuts.map(({ label, icon: Icon }, index) => (
            <div key={index} className="flex w-[80px] flex-col items-center text-center">
              <Button
                variant="round"
                size="shortcut"
                aria-label={typeof label === "string" ? label : "خدمة"}
                onClick={index === 0 ? goToTransfer : undefined}
              >
                <Icon className="size-10" />
              </Button>
              <span className="mt-1 text-[12px] leading-[1.05]">{label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="relative -mt-[8px] rounded-t-[22px] bg-background px-[11px] pt-[8px] pb-4">
        <div className="rounded-[12px] bg-panel px-3 py-2">
          <div className="mb-1.5 flex items-center justify-between">
            <h1 className="text-[16px] font-extrabold">خدمات كاش</h1>
            <Button
              variant="ghost"
              className="h-auto rounded-full bg-muted px-3 py-0.5 text-[12px]"
            >
              عرض الكل
            </Button>
          </div>
          <div className="hide-scrollbar flex justify-between gap-0 overflow-x-auto">
            {services.map(({ label, img }) => (
              <div key={label} className="w-[76px] shrink-0 text-center">
                <div className="relative mx-auto size-[60px]">
                  <img
                    src={img}
                    alt={label}
                    loading="lazy"
                    width={60}
                    height={60}
                    className="size-[60px] rounded-[10px] object-cover"
                  />
                </div>
                <p className="mt-1 whitespace-nowrap text-[9px]">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-[7px] rounded-[12px] bg-panel p-2.5">
          <div className="mb-1 flex items-center justify-between">
            <h2 className="text-[15px] font-extrabold">العروض</h2>
            <div className="flex gap-1" dir="ltr">
              <span className="size-2 rounded-full bg-alert" />
              <span className="size-1.5 rounded-full bg-muted" />
            </div>
          </div>
          <img
            src={offerBanner}
            alt="خدمات النيابة العامة دلوقتي في مكان واحد"
            width={1280}
            height={512}
            className="h-[170px] w-full rounded-[10px] object-cover"
          />
        </div>

        <div className="mt-[7px] grid grid-cols-2 gap-2" dir="rtl">
          <div className="relative flex h-[210px] flex-col justify-end overflow-hidden rounded-[16px] bg-panel p-3">
            <svg
              aria-hidden="true"
              className="absolute inset-0 h-full w-full"
              viewBox="0 0 200 210"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="expensesWave" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7fa5b5" />
                  <stop offset="100%" stopColor="#c9dde7" />
                </linearGradient>
              </defs>
              {/* faint grid */}
              {[52, 104, 156].map((y) => (
                <line key={y} x1="0" y1={y} x2="200" y2={y} stroke="#e2e8ec" strokeWidth="1" />
              ))}
              {[50, 100, 150].map((x) => (
                <line key={x} x1={x} y1="0" x2={x} y2="210" stroke="#e2e8ec" strokeWidth="1" />
              ))}
              {/* wave */}
              <path
                d="M200 40 C 170 40 165 95 135 100 C 105 105 100 150 70 155 C 40 160 25 200 0 210 L 200 210 Z"
                fill="url(#expensesWave)"
              />
              <path
                d="M200 40 C 170 40 165 95 135 100 C 105 105 100 150 70 155 C 40 160 25 200 0 210"
                fill="none"
                stroke="#7fa5b5"
                strokeWidth="2"
              />
            </svg>
            <h2 className="absolute right-3 top-3 text-[16px] font-extrabold">مصروفاتك</h2>
            <p className="relative flex items-baseline gap-1 text-[15px]" dir="rtl">
              <span className="text-[34px] font-normal leading-none tracking-tight">{formatArabicNumber(expenses)}</span>
              <span>جنيه</span>
            </p>
          </div>

          <button
            type="button"
            onClick={goToTransfer}
            className="flex h-[210px] flex-col items-center rounded-[16px] bg-panel p-3 text-center"
          >
            <h2 className="self-start text-[16px] font-extrabold">تحويل اموال</h2>
            <span className="mt-5 grid size-[52px] place-items-center rounded-full bg-alert/10">
              <Send className="size-6 -rotate-12 text-alert" />
            </span>
            <p className="mt-5 text-[13px] leading-[1.5] text-foreground/80">
              ستظهر المفضلات الخاصة بك هنا. اضغط لإدارتها
            </p>
          </button>
        </div>

        <div className="mt-[7px] rounded-[12px] bg-panel p-3">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-[15px] font-extrabold">آخر المعاملات</h2>
            <Button
              variant="ghost"
              className="h-auto rounded-full bg-muted px-3 py-0.5 text-[12px]"
            >
              عرض الكل
            </Button>
          </div>
          <div className="flex flex-col gap-3" dir="rtl">
            {[
              ...transfers.map((t) => ({
                title: `تحويل إلى ${t.senderName || t.phone}`,
                date: formatArabicDate(t.timestamp),
                amount: t.amount % 1 === 0 ? t.amount.toString() : t.amount.toFixed(2),
                icon: ArrowUpRight,
                color: "bg-[#8b5a2b]",
              })),
              {
                title: "تحويل للتخزين",
                date: "13 سبتمبر 2026 - 05:30 م",
                amount: "10",
                icon: ArrowUpRight,
                color: "bg-[#8b5a2b]",
              },
              {
                title: "شحن الرصيد",
                date: "13 سبتمبر 2026 - 01:55 م",
                amount: "5",
                icon: CreditCard,
                color: "bg-[#d93025]",
              },
              {
                title: "مدفوعات المحفظة",
                date: "12 سبتمبر 2026 - 07:51 م",
                amount: "46.50",
                icon: Fingerprint,
                color: "bg-[#f9ab00]",
              },
            ]
              .slice(0, 4)
              .map((tx, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`grid size-11 shrink-0 place-items-center rounded-[12px] text-white ${tx.color}`}
                  >
                    <tx.icon size={22} />
                  </div>
                  <div>
                    <p className="text-[14px] font-extrabold">{tx.title}</p>
                    <p className="text-[11px] text-foreground/60">{tx.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[15px] font-bold text-alert">
                  <ChevronLeft size={16} />
                  <span>{tx.amount} جنيه</span>
                  <span>-</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-[7px] rounded-[22px] bg-panel p-3.5">
          <h2 className="mb-3 text-[15px] font-extrabold">الإعدادات</h2>
          <div className="grid grid-cols-2 gap-3" dir="rtl">
            {[
              { label: "إنشاء الرقم السري", icon: Lock },
              { label: "تغيير الرقم السري", icon: Lock },
              { label: "المساعدة", icon: HelpCircle },
              { label: "الفروع", icon: Store },
            ].map((item) => (
              <button
                key={item.label}
                type="button"
                className="flex h-[40px] items-center justify-center gap-1.5 rounded-[12px] bg-card px-3 text-center shadow-sm"
              >
                <span className="whitespace-nowrap text-[13px] font-medium">{item.label}</span>
                <item.icon size={18} className="shrink-0 text-foreground/80" />
              </button>
            ))}
          </div>
        </div>
      </section>

      {toastVisible && (
        <div className="fixed bottom-[66px] left-1/2 z-30 flex h-[59px] w-[320px] max-w-[calc(100%-36px)] -translate-x-1/2 items-center rounded-full bg-panel px-3 shadow-xl">
          <Button
            variant="ghost"
            aria-label="إغلاق"
            onClick={() => setToastVisible(false)}
            className="grid size-10 shrink-0 place-items-center rounded-full bg-muted"
          >
            <X size={23} />
          </Button>
          <strong className="flex-1 text-center text-[14px]">لا يوجد فواتير مستحقة</strong>
        </div>
      )}

      {transferLoading && (
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

      {pinOpen && (
        <PinSheet
          onClose={() => setPinOpen(false)}
          onComplete={() => {
            setPinOpen(false);
            setBalanceVisible(true);
          }}
        />
      )}

      <nav
        dir="rtl"
        className="fixed bottom-0 left-1/2 z-20 flex h-[66px] w-full max-w-[430px] -translate-x-1/2 items-center justify-around bg-panel px-3 shadow-[0_-4px_18px_color-mix(in_oklab,var(--foreground)_8%,transparent)]"
        aria-label="التنقل الرئيسي"
      >
        <Button variant="nav" size="nav" className="text-alert">
          <span className="flex h-[28px] shrink-0 items-center justify-center">
            <img
              src={walletNavIcon.url}
              alt="المحفظة"
              className="h-[26px] w-auto"
            />
          </span>
          <span className="mt-1 text-[11px] font-bold">المحفظة</span>
        </Button>
        <Button variant="nav" size="nav" onClick={goToTransfer}>
          <span className="grid size-7 place-items-center">
            <TransferIcon className="size-7" />
          </span>
          <span className="mt-1 text-[11px]">تحويل أموال</span>
        </Button>
        <Button variant="nav" size="nav">
          <span className="grid size-7 place-items-center">
            <ServicesIcon className="size-7" />
          </span>
          <span className="mt-1 text-[11px]">الخدمات</span>
        </Button>
      </nav>
    </main>
  );
}

