# راهنمای نصب و راه‌اندازی MongoDB

## گزینه ۱: نصب MongoDB محلی (Local Installation)

### مراحل نصب:

**۱. دانلود MongoDB:**
   - به آدرس https://www.mongodb.com/try/download/community بروید
   - نسخه Windows را دانلود کنید (MSI installer)

**۲. نصب MongoDB:**
   - فایل دانلود شده را اجرا کنید
   - **مسیر نصب:** می‌توانید مسیر پیش‌فرض را بپذیرید (`C:\Program Files\MongoDB`)
   - یا هر مسیر دیگری که می‌خواهید (مثلاً `D:\MongoDB`)
   - **مهم نیست MongoDB کجا نصب شود!** فقط مطمئن شوید که:
     - ✅ گزینه "Install MongoDB as a Service" را انتخاب کنید
     - ✅ گزینه "Install MongoDB Compass" را انتخاب کنید (ابزار گرافیکی برای مدیریت)

**۳. بررسی سرویس MongoDB:**
   - پس از نصب، MongoDB به صورت خودکار به عنوان Windows Service اجرا می‌شود
   - برای بررسی: `Windows + R` → `services.msc` → پیدا کردن "MongoDB"

**۴. تنظیم فایل .env:**
   - در پوشه `backend` فایل `.env` ایجاد کنید (کپی از `.env.example`)
   - محتویات:
     ```
     PORT=3000
     MONGODB_URI=mongodb://localhost:27017/hotline
     ```

**۵. تست اتصال:**
   ```bash
   cd backend
   npm start
   ```

---

## گزینه ۲: استفاده از MongoDB Atlas (کلود - رایگان) - توصیه می‌شود

### مزایا:
- ✅ نیازی به نصب محلی نیست
- ✅ رایگان (برای شروع)
- ✅ همیشه در دسترس
- ✅ بک‌آپ خودکار

### مراحل:

**۱. ایجاد حساب:**
   - به https://www.mongodb.com/cloud/atlas/register بروید
   - حساب رایگان ایجاد کنید

**۲. ایجاد Cluster:**
   - پس از ورود، روی "Build a Database" کلیک کنید
   - گزینه "Free" را انتخاب کنید
   - Cloud Provider: AWS (یا هر کدام که دوست دارید)
   - Region: نزدیک‌ترین منطقه به شما
   - Cluster Name: هر نامی که می‌خواهید (مثلاً `hotline-cluster`)

**۳. ایجاد کاربر:**
   - Username: انتخاب کنید (مثلاً `hotline-admin`)
   - Password: یک رمز قوی انتخاب کنید (ذخیره کنید!)
   - Database User Privileges: "Atlas admin"

**۴. تنظیم Network Access:**
   - در بخش "Network Access"
   - روی "Add IP Address" کلیک کنید
   - برای تست: "Allow Access from Anywhere" (0.0.0.0/0)
   - ⚠️ برای production بهتر است IP خود را مشخص کنید

**۵. دریافت Connection String:**
   - در صفحه Cluster، روی "Connect" کلیک کنید
   - "Connect your application" را انتخاب کنید
   - Driver: Node.js
   - نسخه: 5.5 or later
   - Connection String را کپی کنید (مثلاً):
     ```
     mongodb+srv://hotline-admin:<password>@hotline-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```

**۶. تنظیم فایل .env:**
   - در پوشه `backend` فایل `.env` ایجاد کنید
   - محتویات:
     ```
     PORT=3000
     MONGODB_URI=mongodb+srv://hotline-admin:YOUR_PASSWORD@hotline-cluster.xxxxx.mongodb.net/hotline?retryWrites=true&w=majority
     ```
   - `<password>` را با رمز عبوری که انتخاب کردید جایگزین کنید
   - `hotline` بعد از `.net/` نام دیتابیس است

**۷. تست اتصال:**
   ```bash
   cd backend
   npm start
   ```

---

## توصیه

برای شروع و تست، **MongoDB Atlas (کلود)** را پیشنهاد می‌کنم چون:
- سریع‌تر راه‌اندازی می‌شود
- نیازی به نصب نیست
- رایگان است
- همیشه در دسترس است

اما اگر می‌خواهید به صورت محلی کار کنید، MongoDB Community Edition را نصب کنید و مسیر نصب مهم نیست، فقط مطمئن شوید که به عنوان Service اجرا می‌شود.
