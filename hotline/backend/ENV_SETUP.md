# راهنمای تنظیم متغیرهای محیطی

برای راه‌اندازی پروژه، فایل `.env` را در پوشه `backend` ایجاد کنید و متغیرهای زیر را تنظیم کنید:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/hotline

# Server Port
PORT=3000

# JWT Secret Key (تغییر دهید به یک رشته تصادفی قوی - حداقل ۳۲ کاراکتر)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars

# Environment
NODE_ENV=development

# Rate Limiting (اختیاری)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## نکات مهم:

**۱. JWT_SECRET:** حتماً یک رشته تصادفی قوی (حداقل ۳۲ کاراکتر) استفاده کنید. می‌توانید از دستور زیر استفاده کنید:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

**۲. MONGODB_URI:** آدرس اتصال به MongoDB خود را وارد کنید.

**۳. NODE_ENV:** در production حتماً `production` قرار دهید.

## ایجاد فایل .env:

```bash
# در پوشه backend
copy ENV_SETUP.md .env
# سپس فایل .env را ویرایش کنید
```
