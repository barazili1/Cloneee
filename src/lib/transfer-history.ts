export interface TransferRecord {
  id: string;
  amount: number;
  phone: string;
  senderName: string;
  timestamp: number;
}

const STORAGE_KEY = "wallet.transfers";
const INITIAL_BALANCE = 70000;
const INITIAL_EXPENSES = 7314.7;

const arabicDigits = [
  "٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩",
];

const arabicMonths = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
];

export function getTransfers(): TransferRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as TransferRecord[]) : [];
  } catch {
    return [];
  }
}

export function addTransfer(
  amount: number,
  phone: string,
  senderName: string,
): TransferRecord {
  const transfers = getTransfers();
  const record: TransferRecord = {
    id: Math.random().toString(36).slice(2) + Date.now().toString(36),
    amount,
    phone,
    senderName,
    timestamp: Date.now(),
  };
  transfers.unshift(record);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transfers));
  return record;
}

export function getBalance(): number {
  return INITIAL_BALANCE - getTransfers().reduce((s, t) => s + t.amount, 0);
}

export function getExpenses(): number {
  return INITIAL_EXPENSES + getTransfers().reduce((s, t) => s + t.amount, 0);
}

/** Format a number with Arabic-Indic digits, thousands separator, and Arabic decimal point. */
export function formatArabicNumber(value: number, decimals = 2): string {
  const fixed = value.toFixed(decimals);
  const parts = fixed.split(".");
  const intPart = parts[0] ?? "0";
  const decPart = parts[1] ?? "";
  const withThousands = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const toArabic = (s: string) =>
    s.replace(/[0-9]/g, (d) => arabicDigits[parseInt(d, 10)]!);
  if (decPart) {
    return toArabic(withThousands) + "٫" + toArabic(decPart);
  }
  return toArabic(withThousands);
}

/** Format a timestamp as "D MonthName YYYY - H:MM ص/م" */
export function formatArabicDate(ts: number): string {
  const d = new Date(ts);
  const day = d.getDate();
  const month = arabicMonths[d.getMonth()];
  const year = d.getFullYear();
  let h = d.getHours();
  const m = d.getMinutes();
  const period = h < 12 ? "ص" : "م";
  h = h % 12 || 12;
  const mm = String(m).padStart(2, "0");
  return `${day} ${month} ${year} - ${h}:${mm} ${period}`;
}
