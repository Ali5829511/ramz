# 🚀 دليل النشر - Ramz Abda Platform

## البيئة المطلوبة
- Node.js 20+
- npm/pnpm

## متغيرات البيئة المطلوبة

أضف هذه المتغيرات في منصة النشر:

```
VITE_SUPABASE_URL=https://nqpoktshudssuglgxmvp.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_TrTzNSa5xZRuvu-UxQKayw_5mph2fzs
WA_VERIFY_TOKEN=ramz_wh_2026_abda
NODE_ENV=production
TRUST_PROXY=true
```

## خيارات النشر

### 1️⃣ Replit (الأسهل)
1. اذهب إلى: https://replit.com/github/Ali5829511/ramz
2. اضغط "Import from GitHub"
3. أضف متغيرات البيئة أعلاه في Secrets
4. اضغط Run

**الرابط:** `https://ramz-[username].replit.dev`

---

### 2️⃣ Railway.app
1. اذهب إلى: https://railway.app
2. اضغط "New Project" → "Deploy from GitHub"
3. اختر: `Ali5829511/ramz`
4. أضف متغيرات البيئة في Railway
5. Deploy تلقائي ✅

**الرابط:** `https://ramz-production.railway.app`

---

### 3️⃣ Fly.io
```bash
flyctl deploy
```

---

### 4️⃣ Docker (أي منصة)
```bash
docker build -t ramz-abda .
docker run -p 3000:3000 \
  -e VITE_SUPABASE_URL=https://nqpoktshudssuglgxmvp.supabase.co \
  -e VITE_SUPABASE_ANON_KEY=sb_publishable_TrTzNSa5xZRuvu-UxQKayw_5mph2fzs \
  -e WA_VERIFY_TOKEN=ramz_wh_2026_abda \
  -e NODE_ENV=production \
  ramz-abda
```

---

## ✅ التحقق من النشر

بعد النشر، اختبر:
```bash
curl https://[your-production-url]/healthz
# يجب أن ترد: {"status":"ok"}
```

---

## 🔗 ربط WhatsApp Webhook

بعد الحصول على رابط الإنتاج:

1. اذهب لـ Meta Developer Dashboard
2. اختر تطبيقك → WhatsApp → Configuration
3. في "Callback URL" أضف:
   ```
   https://[your-production-url]/api/whatsapp/webhook
   ```
4. في "Verify Token" أضف:
   ```
   ramz_wh_2026_abda
   ```
5. اضغط "Verify and Save"
6. تفعيل الـ webhooks: `messages` و `message_status`

---

## 📝 ملاحظات
- المشروع يبني تلقائياً عند الدفع إلى GitHub
- كل منصة لها ملف إعدادات منفصل:
  - `fly.toml` → Fly.io
  - `.replit` + `replit.nix` → Replit
  - `railway.json` → Railway
  - `Dockerfile` → أي منصة Docker

