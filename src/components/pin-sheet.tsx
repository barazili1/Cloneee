import { Delete } from "lucide-react";
import { useState } from "react";

import vodafoneCashLogo from "@/assets/cash-logo.asset.json";

export const WALLET_PIN = "200200";

export function PinSheet({
  onClose,
  onComplete,
}: {
  onClose: () => void;
  onComplete: () => void;
}) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  const press = (digit: string) => {
    if (pin.length >= 6) return;
    const next = pin + digit;
    setPin(next);
    if (next.length === 6) {
      if (next === WALLET_PIN) {
        setTimeout(onComplete, 250);
      } else {
        setError(true);
        setTimeout(() => {
          setPin("");
          setError(false);
        }, 600);
      }
    }
  };

  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

  return (
    <div className="fixed inset-0 z-50 mx-auto flex max-w-[430px] flex-col justify-end">
      <button
        type="button"
        aria-label="إغلاق"
        className="absolute inset-0 h-full w-full cursor-default bg-black/85"
        onClick={onClose}
      />
      <div className="relative flex h-full flex-col items-center rounded-t-[28px] bg-[#eeeeee] px-6 pt-10 text-foreground">
        <div className="flex flex-col items-center">
          <img
            src={vodafoneCashLogo.url}
            alt="كاش"
            width={90}
            height={110}
            className="h-[90px] w-auto object-contain"
          />
        </div>

        <h2 className="mt-8 text-[20px] font-bold">ادخل رقم المحفظة السري</h2>

        <div className="mt-5 flex flex-row-reverse gap-3" dir="ltr">
          {Array.from({ length: 6 }).map((_, i) => (
            <span
              key={i}
              className={`size-[14px] rounded-full ${
                error
                  ? "bg-[#e60000]"
                  : i < pin.length
                    ? "bg-foreground/70"
                    : "bg-foreground/25"
              }`}
            />
          ))}
        </div>
        {error && (
          <p className="mt-3 text-[14px] font-medium text-[#e60000]">
            الرقم السري غير صحيح
          </p>
        )}

        <button type="button" className="mt-5 text-[14px] font-medium text-alert">
          نسيت الرقم السري؟
        </button>

        <div className="mt-auto grid w-full max-w-[340px] grid-cols-3 gap-x-6 gap-y-4 pb-10" dir="ltr">
          {keys.map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => press(digit)}
              className="grid size-[72px] place-items-center justify-self-center rounded-full bg-white text-[28px] font-medium shadow-sm transition-transform active:scale-95"
            >
              {digit}
            </button>
          ))}
          <span />
          <button
            type="button"
            onClick={() => press("0")}
            className="grid size-[72px] place-items-center justify-self-center rounded-full bg-white text-[28px] font-medium shadow-sm transition-transform active:scale-95"
          >
            0
          </button>
          <button
            type="button"
            aria-label="مسح"
            onClick={() => setPin((value) => value.slice(0, -1))}
            className="grid size-[72px] place-items-center justify-self-center rounded-full text-foreground transition-transform active:scale-95"
          >
            <Delete size={32} />
          </button>
        </div>
      </div>
    </div>
  );
}
