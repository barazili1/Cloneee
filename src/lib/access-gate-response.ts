type Reason = "invalid" | "expired" | "device_limit";

function texts(reason: Reason) {
  if (reason === "expired") {
    return {
      title: "انتهت صلاحية الرابط",
      desc: "الرابط ده مش شغّال دلوقتي، اطلب رابط جديد.",
    };
  }
  if (reason === "device_limit") {
    return {
      title: "تم تجاوز عدد الأجهزة المسموح بها",
      desc: "الرابط ده استخدمه أقصى عدد من الأجهزة.",
    };
  }
  return {
    title: "الوصول مرفوض",
    desc: "مش مسموحلك تدخل الصفحة دي بدون رابط صالح.",
  };
}

export function renderDenyPage(reason: Reason): string {
  const { title, desc } = texts(reason);
  return `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<meta name="robots" content="noindex,nofollow"/>
<title>${title}</title>
<style>
  html,body{margin:0;padding:0;height:100%;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Tahoma,Arial,sans-serif;background:#0b1220;color:#fff}
  .wrap{min-height:100%;display:flex;align-items:center;justify-content:center;padding:24px;background:linear-gradient(135deg,#020617,#0f172a,#450a0a)}
  .card{max-width:360px;width:100%;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:24px;padding:32px;text-align:center;backdrop-filter:blur(10px);box-shadow:0 25px 50px -12px rgba(0,0,0,.5)}
  .icon{width:64px;height:64px;border-radius:9999px;background:rgba(239,68,68,.15);color:#f87171;display:flex;align-items:center;justify-content:center;margin:0 auto}
  h1{font-size:20px;font-weight:700;margin:20px 0 8px}
  p{font-size:14px;line-height:1.6;color:rgba(255,255,255,.7);margin:0}
</style></head><body>
<div class="wrap"><div class="card">
<div class="icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M4.93 4.93l14.14 14.14"/></svg></div>
<h1>${title}</h1><p>${desc}</p>
</div></div></body></html>`;
}

export function denyResponse(reason: Reason): Response {
  return new Response(renderDenyPage(reason), {
    status: 403,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}
