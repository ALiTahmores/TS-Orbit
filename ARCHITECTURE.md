# مستندات معماری فنی و زیرساخت سامانه TS Orbit
## TS Orbit - Enterprise Business Operations Platform

این سند به عنوان مرجع جامع فنی برای مهندسان ارشد نرم‌افزار، معماران سیستم و تیم‌های DevOps جهت استقرار، نگهداری و توسعه پلتفرم **TS Orbit** آماده شده است.

---

## ۱. نمای کلی سیستم و فلسفه طراحی (System Overview & Design Philosophy)

پلتفرم **TS Orbit** یک سامانه یکپارچه مدیریت عملیات سازمانی (Enterprise Operations & Multi-Tenant Agency Management) است که بر پایه معماری مدرن SPA با بک‌اند سبک و ارتباطات واقعی (Real-Time) بنا شده است.

### اصول کلیدی معماری:
- **Zero-State Initialization (آماده‌سازی صفر مطلق بر پایه داده‌های واقعی):** تمام داده‌های ساختگی، دمو و آزمایشگاهی از سیستم پاکسازی شده‌اند. سامانه در حالت پایه‌گذاری خام (Clean Slate) بالا می‌آید و آماده دریافت داده‌های واقعی سازمان می‌باشد.
- **طراحی مبتنی بر راست‌به‌چپ (RTL-First Design Language):** پشتیبانی کامل نیتیو از فونت وزیرمتن (Vazirmatn)، چیدمان هوشمند متناسب با زبان فارسی، و قابلیت سوئیچ بین حالت‌های Light و Dark با رعایت استانداردهای دسترسی‌پذیری (WCAG AA).
- **استانداردهای یکپارچه رابط کاربری (Global UI Standards):**
  - **تولتیپ‌های سراسری (Unified Tooltip Component):** استفاده از یک کامپوننت متمرکز با انیمیشن‌های ورود نرم، پشتیبانی از تم‌های تیره/روشن و موقعیت‌یابی هوشمند برای تمام نشانگرهای سیستم.
  - **جداول واکنش‌گرا و هوشمند (Auto-Sizing Tables with Text Truncation):** جدول لیست پروژه‌ها و دپارتمان‌ها به صورت خودکار متناسب با محتوای سلول‌ها ستون‌بندی شده و متون طولانی با `...` خلاصه‌سازی می‌شوند. با نگه داشتن ماوس روی عنوان‌ها، متن کامل در تولتیپ اختصاصی نمایش داده می‌شود.

---

## ۲. معماری فرانت‌اند و تک‌استک (Frontend Architecture & Tech Stack)

فرانت‌اند به صورت یک Single Page Application (SPA) سریع و بدون رندر اضافه پیاده‌سازی شده است.

| لایه / قابلیت | تکنولوژی و نسخه | توضیحات و کاربرد |
| :--- | :--- | :--- |
| **فریم‌ورک اصلی** | React 19.0.0 | کتابخانه اصلی ساخت رابط کاربری کامپوننت‌محور |
| **باندلر و ساخت** | Vite 6.2.0 | محیط توسعه فوق‌العاده سریع و باندلر نهایی فرانت‌اند |
| **زبان برنامه‌نویسی** | TypeScript 5.8.2 | تایپ‌اسکریپت با قوانین strict برای تضمین پایداری کدهای فرانت و بک |
| **استایل‌دهی و CSS** | Tailwind CSS v4 | فریم‌ورک یوتیلیتی CSS با پلاگین رسمی Vite و فونت‌های فارسی |
| **انیمیشن‌ها** | Motion React 12.23 | انیمیشن‌های روان مودال‌ها، کشوها (Drawers) و ترانزیشن صفحات |
| **آیکون‌ها** | Lucide React 0.546 | کتابخانه آیکون‌های برداری سبک و یکدست |
| **چارت‌ها و آمار** | Recharts 3.9.0 | رسم نمودارهای هوش تجاری، پیشرفت پروژه‌ها و گزارشات عملکردی |
| **مدیریت وضعیت** | React Context API | مدیریت متمرکز و ماژولار وضعیت‌ها (`ProjectContext`, `TeamContext`, `NotificationContext`) |

---

## ۳. لایه بک‌اند و ارتباطات هم‌زمان (Backend & Infrastructure Layer)

سرویس بک‌اند پلتفرم، وظیفه مدیریت APIها، احراز هویت، سوکت‌های هم‌زمان و ارتباط با دیتابیس را بر عهده دارد.

| لایه / بخش | تکنولوژی | توضیحات |
| :--- | :--- | :--- |
| **محیط اجرا (Runtime)** | Node.js (LTS v20.x+) | محیط اجرای جاوااسکریپت/تایپ‌اسکریپت سمت سرور |
| **فریم‌ورک سرور** | Express 4.21.2 | فریم‌ورک لایه HTTP و Routing APIها |
| **ارتباطات هم‌زمان** | Socket.IO 4.8.1 | زیرساخت WebSocket برای چت زنده گروهی، تایپینگ هم‌زمان و اعلان‌های لحظه‌ای |
| **احراز هویت و امنیت** | JWT & BcryptJS | توکن‌های هوشمند JWT همراه با هش رمزنگاری‌شده رمزعبورها |
| **اعتبارسنجی داده‌ها** | Zod 3.24.2 | اعتبارسنچی دقیق داده‌های ورودی API قبل از ذخیره‌سازی |
| **هوش مصنوعی** | Google GenAI SDK | سرویس هوش مصنوعی رسمی Gemini (`@google/genai 0.1.1`) جهت پردازش‌های پیشرفته |
| **سرویس دیتابیس** | File-backed JSON Service | دیتابیس سبک و ایزوله با پایداری کامل جهت نگهداری تراکنش‌ها و لایت‌ویت بودن زیرساخت |

---

## ۴. چرخه خط لوله کامپایل و بیلد (Compilation & Bundling Pipeline)

توسعه و استقرار پلتفرم از یک فرایند بیلد تک‌مرحله‌ای منسجم پیروی می‌کند:

### اسکریپت‌های موجود در `package.json`:
- `npm run dev`: اجرا به وسیله `tsx server.ts` و فعال‌سازی Vite Middleware بر روی پورت **3000**.
- `npm run build`: اجرای فرآیند بیلد دوگانه:
  1. کامپایل فرانت‌اند توسط `vite build` و تولید فایل‌های استاتیک در پوشه `/dist`.
  2. کامپایل بک‌اند توسط `esbuild` و تولید یک فایل واحد و بهینه‌شده CommonJS در `dist/server.cjs`.
- `npm run start`: اجرای مستقیم سرور تولید به وسیله `node dist/server.cjs`.

```bash
# بیلد کامل پروژه برای استقرار در تولید
npm run build

# اجرای سرور تولید
npm run start
```

---

## ۵. نقشه ساختار پوشه‌ها و کامپوننت‌ها (Directory Structure)

```text
ts-orbit-platform/
├── dist/                      # خروجی بیلد نهایی (استاتیک + server.cjs)
├── public/                    # دارایی‌های عمومی (تصاویر، لوگوها، آیکون‌ها)
├── src/
│   ├── components/            # کامپوننت‌های رابط کاربری
│   │   ├── common/            # کامپوننت‌های عمومی (Tooltip، CustomSelect و ...)
│   │   ├── navigation/        # نوار ابزار و ناوبری اصلی
│   │   ├── projects/          # مدیریت پروژه‌ها، جداول، فایل‌ها و کانبان
│   │   ├── widgets/           # ویجت‌ها و نمودارهای هوش تجاری
│   │   ├── ApprovalCenter.tsx  # مرکز تاییدات و مدیریت سطح دسترسی
│   │   ├── DashboardView.tsx   # داشبورد اصلی و کنترل‌سنتر
│   │   ├── OrgBuilder.tsx     # ساختاردهی سازمان و دپارتمان‌ها
│   │   └── TeamChat.tsx       # سیستم چت و پیام‌رسانی هم‌زمان
│   ├── context/               # لایه مدیریت وضعیت (ProjectContext.tsx)
│   ├── data/                  # سرویس ذخیره‌سازی داده‌ها (dbService.ts)
│   ├── index.css              # تنظیمات فونت‌ها و استایل‌های Tailwind CSS
│   ├── main.tsx               # نقطه ورود فرانت‌اند React
│   └── types.ts               # تعاریف تایپ‌ها و اینترفیس‌های کلیدی
├── server.ts                  # سرور اصلی Express + Socket.IO + Vite Middleware
├── ARCHITECTURE.md            # سند معماری فنی پروژه (همین فایل)
├── README.md                  # راهنمای سریع راه‌اندازی و معرفی
├── package.json               # بسته وابستگی‌ها و اسکریپت‌ها
├── tsconfig.json              # تنظیمات تایپ‌اسکریپت
└── vite.config.ts             # تنظیمات بیلد Vite
```

---

## ۶. الزامات استقرار، کانتینرسازی و DevOps (Deployment & Infrastructure Requirements)

برای استقرار پلتفرم TS Orbit در محیط تولید (سرویس‌های ابری نظیر پلاتفرم‌های ایرانی مثل **لیارا** یا سرورهای اختصاصی **VPS**):

### ۱. حداقل مشخصات زیرساخت سرور:
- **پردازنده (CPU):** ۱ یا ۲ هسته (vCPU)
- **حافظه رم (RAM):** حداقل ۱ گیگابایت (پیشنهاد شده ۲ گیگابایت برای عملکرد بهینه WebSocket)
- **پورت ورودی:** پورت **3000** (الزامی)

### ۲. نمونه فایل کانتینرسازی (Dockerfile):

```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# کپی وابستگی‌ها و نصب آن‌ها
COPY package*.json ./
RUN npm ci

# کپی سورس‌کد و ساخت بیلد نهایی
COPY . .
RUN npm run build

# لایه اجرای نهایی
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/server.cjs"]
```

### ۳. تنظیمات نمونه Reverse Proxy (Nginx Directive):

در صورت استفاده از Nginx برای SSL termination و مدیریت دامنه، پیکربندی هدرهای **WebSocket Upgrade** بسیار حیاتی است:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        
        # پشتیبانی از پروتکل WebSocket (Socket.IO)
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## ۷. نتیجه‌گیری و وضعیت نهایی سیستم

پلتفرم **TS Orbit** با گذر از مراحل بهینه‌سازی، پاکسازی داده‌های آزمایشگاهی و پیاده‌سازی جداول هوشمند مبتنی بر تولتیپ سراسری، آماده استقرار کامل در محیط‌های پروداکشن سازمانی می‌باشد.
