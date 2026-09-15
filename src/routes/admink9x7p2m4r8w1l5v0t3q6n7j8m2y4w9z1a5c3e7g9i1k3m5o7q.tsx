import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ReactNode, type FormEvent } from "react";
import { Copy, Check, KeyRound, Loader2, Plus, Trash2 } from "lucide-react";

import {
  createAccessKey,
  deleteAccessKey,
  listAccessKeys,
  type AccessKeyRecord,
} from "@/lib/access-keys.functions";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute(
  "/admink9x7p2m4r8w1l5v0t3q6n7j8m2y4w9z1a5c3e7g9i1k3m5o7q",
)({
  head: () => ({ meta: [{ title: "Admin" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: AdminPage,
});

type Unit = "minute" | "hour" | "day" | "week";
type KeyRow = AccessKeyRecord;

const UNIT_LABELS: Record<Unit, string> = {
  minute: "دقيقة",
  hour: "ساعة",
  day: "يوم",
  week: "أسبوع",
};

const SITE_BASE = "https://vodafone-xcashx.vercel.app";

function AdminPage() {
  const create = createAccessKey;
  const list = listAccessKeys;
  const remove = deleteAccessKey;

  const [codeName, setCodeName] = useState("");
  const [unit, setUnit] = useState<Unit>("day");
  const [amount, setAmount] = useState<number>(1);
  const [maxDevices, setMaxDevices] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<KeyRow[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function refresh() {
    try {
      const r = await list();
      setRows(r);
    } catch (e) {
      setError(e instanceof Error ? e.message : "خطأ");
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!codeName.trim()) {
      setError("لازم تدخل اسم الكود");
      return;
    }
    setLoading(true);
    try {
      await create({ data: { codeName: codeName.trim(), unit, amount, maxDevices } });
      setCodeName("");
      setAmount(1);
      setMaxDevices(1);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "خطأ في إنشاء المفتاح");
    } finally {
      setLoading(false);
    }
  }

  async function onDelete(id: string) {
    if (!confirm("متأكد إنك عايز تمسح المفتاح؟")) return;
    await remove({ data: { id } });
    await refresh();
  }

  async function copyLink(row: KeyRow) {
    const url = `${SITE_BASE}/${row.token}`;
    await navigator.clipboard.writeText(url);
    setCopiedId(row.id);
    setTimeout(() => setCopiedId((c) => (c === row.id ? null : c)), 1500);
  }

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-10 text-white">
      <div className="mx-auto max-w-3xl space-y-8">
        <header className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-500/15 text-red-400">
            <KeyRound size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">لوحة التحكم</h1>
            <p className="text-sm text-white/60">إنشاء وإدارة مفاتيح الدخول</p>
          </div>
        </header>

        <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur">
          <h2 className="mb-5 text-lg font-semibold">إنشاء مفتاح جديد</h2>
          <form onSubmit={onCreate} className="space-y-4">
            <Field label="اسم الكود">
              <input
                value={codeName}
                onChange={(e) => setCodeName(e.target.value)}
                placeholder="مثال: عميل رقم 1"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 outline-none focus:border-red-400/60 focus:bg-white/10"
                maxLength={80}
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="مدة الصلاحية">
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value as Unit)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-red-400/60"
                >
                  {(["minute", "hour", "day", "week"] as Unit[]).map((u) => (
                    <option key={u} value={u} className="bg-slate-900">
                      {UNIT_LABELS[u]}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label={`عدد (${UNIT_LABELS[unit]})`}>
                <input
                  type="number"
                  min={1}
                  value={amount}
                  onChange={(e) => setAmount(Math.max(1, Number(e.target.value) || 1))}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-red-400/60"
                />
              </Field>
            </div>

            <Field label="عدد الأجهزة المسموح بها">
              <input
                type="number"
                min={1}
                value={maxDevices}
                onChange={(e) => setMaxDevices(Math.max(1, Number(e.target.value) || 1))}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-red-400/60"
              />
            </Field>

            {error && (
              <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-red-500 py-6 text-base font-semibold text-white hover:bg-red-600"
            >
              {loading ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" /> جاري الإنشاء…
                </>
              ) : (
                <>
                  <Plus className="ml-2 h-4 w-4" /> إنشاء مفتاح
                </>
              )}
            </Button>
          </form>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur">
          <h2 className="mb-5 text-lg font-semibold">المفاتيح المُنشأة</h2>
          {rows.length === 0 ? (
            <p className="text-sm text-white/50">لا توجد مفاتيح بعد.</p>
          ) : (
            <ul className="space-y-3">
              {rows.map((row) => (
                <KeyItem
                  key={row.id}
                  row={row}
                  copied={copiedId === row.id}
                  onCopy={() => copyLink(row)}
                  onDelete={() => onDelete(row.id)}
                />
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-medium text-white/70">{label}</span>
      {children}
    </label>
  );
}

function KeyItem({
  row,
  copied,
  onCopy,
  onDelete,
}: {
  row: KeyRow;
  copied: boolean;
  onCopy: () => void;
  onDelete: () => void;
}) {
  const link = `${SITE_BASE}/${row.token}`;
  const expiresAt = useMemo(() => new Date(row.expires_at), [row.expires_at]);
  const expired = expiresAt.getTime() < Date.now();
  const timeLeft = useMemo(() => humanTimeLeft(expiresAt), [expiresAt]);

  return (
    <li className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-semibold text-white">{row.code_name}</span>
            {expired ? (
              <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-[10px] font-medium text-red-300">منتهي</span>
            ) : (
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-medium text-emerald-300">فعّال</span>
            )}
          </div>
          <div className="mt-2 flex items-center gap-2">
            <code className="flex-1 truncate rounded-lg bg-black/40 px-2 py-1.5 text-[11px] text-white/80" dir="ltr">
              {link}
            </code>
            <button
              onClick={onCopy}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20"
              aria-label="نسخ"
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            </button>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-white/60">
            <span>الأجهزة: {row.device_count}/{row.max_devices}</span>
            <span>ينتهي: {timeLeft}</span>
          </div>
        </div>
        <button
          onClick={onDelete}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20"
          aria-label="حذف"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </li>
  );
}

function humanTimeLeft(d: Date): string {
  const diff = d.getTime() - Date.now();
  if (diff <= 0) return "انتهى";
  const s = Math.floor(diff / 1000);
  const days = Math.floor(s / 86400);
  const hours = Math.floor((s % 86400) / 3600);
  const mins = Math.floor((s % 3600) / 60);
  if (days > 0) return `بعد ${days} يوم و${hours} ساعة`;
  if (hours > 0) return `بعد ${hours} ساعة و${mins} دقيقة`;
  return `بعد ${mins} دقيقة`;
}
