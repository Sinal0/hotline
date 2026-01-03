# راهنمای استفاده از API

## راه‌اندازی Server

1. نصب dependencies:
```bash
cd backend
npm install
```

2. راه‌اندازی server:
```bash
npm start
```

Server روی `http://localhost:3000` اجرا می‌شود.

## تست API با curl

برای تست API endpoints، باید از URL کامل استفاده کنید:

### مثال‌های curl:

```bash
# دریافت تمام محصولات
curl http://localhost:3000/api/products

# دریافت محصول با ID
curl http://localhost:3000/api/products/1

# جستجوی محصولات
curl http://localhost:3000/api/products/search/laptop

# دریافت محصولات بر اساس دسته‌بندی
curl http://localhost:3000/api/products/category/electronics

# دریافت تمام تأمین‌کنندگان
curl http://localhost:3000/api/suppliers
```

### در PowerShell (Windows):

```powershell
# دریافت تمام محصولات
Invoke-WebRequest -Uri "http://localhost:3000/api/products" -Method GET

# یا با curl (اگر نصب باشد)
curl.exe http://localhost:3000/api/products
```

### در مرورگر:

می‌توانید مستقیماً در مرورگر باز کنید:
- http://localhost:3000/api/products
- http://localhost:3000/api/suppliers
- و غیره...

## نکته مهم

**همیشه URL کامل را استفاده کنید**: `http://localhost:3000/api/...`

اگر فقط `curl` یا یک URL ناقص بنویسید، مرورگر یا سیستم ممکن است آن را به عنوان جستجو تفسیر کند.

