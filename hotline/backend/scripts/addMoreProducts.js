const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Product = require('../models/Product');

// Connect to database
const connectDB = require('../config/database');

// Additional sample products
const additionalProducts = [
    // الکترونیک
    {
        name: 'هدفون بی‌سیم اپل AirPods Pro',
        supplier: 'واردکننده لوازم الکترونیکی',
        price: 12000000,
        category: 'electronics',
        stock: 150,
        description: 'هدفون بی‌سیم با نویز کنسلینگ و کیفیت صدای استثنایی',
        image: '/pictures/products/airpods.jpg',
        minOrder: 2,
        approved: true,
    },
    {
        name: 'ساعت هوشمند اپل Watch Series 9',
        supplier: 'واردکننده لوازم الکترونیکی',
        price: 28000000,
        category: 'electronics',
        stock: 80,
        description: 'ساعت هوشمند با صفحه نمایش همیشه روشن و GPS',
        image: '/pictures/products/apple-watch.jpg',
        minOrder: 1,
        approved: true,
    },
    {
        name: 'تبلت سامسونگ Galaxy Tab S9',
        supplier: 'توزیع‌کننده لوازم الکترونیکی',
        price: 32000000,
        category: 'electronics',
        stock: 60,
        description: 'تبلت 11 اینچی با قلم S Pen و صفحه نمایش Super AMOLED',
        image: '/pictures/products/tablet.jpg',
        minOrder: 1,
        approved: true,
    },
    {
        name: 'اسپیکر بلوتوث JBL Charge 5',
        supplier: 'واردکننده لوازم صوتی',
        price: 8500000,
        category: 'electronics',
        stock: 120,
        description: 'اسپیکر قابل حمل با باتری 20 ساعته و ضد آب',
        image: '/pictures/products/speaker.jpg',
        minOrder: 3,
        approved: true,
    },
    
    // پوشاک
    {
        name: 'کاپشن زمستانی مردانه',
        supplier: 'کارخانه پوشاک تهران',
        price: 1200000,
        category: 'clothing',
        stock: 400,
        description: 'کاپشن گرم و ضد آب با آستر پلی‌استر',
        image: '/pictures/products/jacket.jpg',
        minOrder: 5,
        approved: true,
    },
    {
        name: 'کفش کتانی کونورس',
        supplier: 'واردکننده کفش',
        price: 1800000,
        category: 'clothing',
        stock: 250,
        description: 'کفش کتانی کلاسیک با کفی راحت',
        image: '/pictures/products/sneakers.jpg',
        minOrder: 2,
        approved: true,
    },
    {
        name: 'لباس ورزشی زنانه ست',
        supplier: 'کارخانه پوشاک تهران',
        price: 950000,
        category: 'clothing',
        stock: 350,
        description: 'ست لباس ورزشی از جنس پلی‌استر و الاستیک',
        image: '/pictures/products/sportswear.jpg',
        minOrder: 5,
        approved: true,
    },
    
    // مواد غذایی
    {
        name: 'عسل طبیعی کوهستان',
        supplier: 'زنبورداری کوهستان',
        price: 1200000,
        category: 'food',
        stock: 600,
        description: 'عسل طبیعی 100% خالص از کوهستان، بسته‌بندی 1 کیلویی',
        image: '/pictures/products/honey.jpg',
        minOrder: 6,
        approved: true,
    },
    {
        name: 'زعفران ممتاز قائنات',
        supplier: 'تولیدکننده زعفران',
        price: 3500000,
        category: 'food',
        stock: 200,
        description: 'زعفران درجه یک قائنات، بسته‌بندی 10 گرمی',
        image: '/pictures/products/saffron.jpg',
        minOrder: 5,
        approved: true,
    },
    {
        name: 'پسته اکبری رفسنجان',
        supplier: 'تولیدکننده پسته',
        price: 2800000,
        category: 'food',
        stock: 450,
        description: 'پسته اکبری درجه یک رفسنجان، بسته‌بندی 1 کیلویی',
        image: '/pictures/products/pistachio.jpg',
        minOrder: 5,
        approved: true,
    },
    {
        name: 'چای دمنوش گیاهی',
        supplier: 'باغ چای شمال',
        price: 450000,
        category: 'food',
        stock: 700,
        description: 'چای دمنوش مخلوط گیاهی، بسته‌بندی 100 عددی',
        image: '/pictures/products/herbal-tea.jpg',
        minOrder: 10,
        approved: true,
    },
    
    // خانه و آشپزخانه
    {
        name: 'قابلمه استیل ضد زنگ 5 لیتری',
        supplier: 'تولیدکننده لوازم آشپزخانه',
        price: 850000,
        category: 'home',
        stock: 300,
        description: 'قابلمه استیل با دسته‌های راحت و کف ضخیم',
        image: '/pictures/products/pot.jpg',
        minOrder: 5,
        approved: true,
    },
    {
        name: 'ماشین ظرفشویی بوش',
        supplier: 'واردکننده لوازم خانگی',
        price: 22000000,
        category: 'home',
        stock: 25,
        description: 'ماشین ظرفشویی 12 نفره با برنامه‌های مختلف شستشو',
        image: '/pictures/products/dishwasher.jpg',
        minOrder: 1,
        approved: true,
    },
    {
        name: 'فرش ماشینی 6 متری',
        supplier: 'کارخانه فرش ماشینی',
        price: 4500000,
        category: 'home',
        stock: 100,
        description: 'فرش ماشینی با تراکم بالا و رنگ‌های ثابت',
        image: '/pictures/products/carpet.jpg',
        minOrder: 1,
        approved: true,
    },
    {
        name: 'روتختی ست 4 تکه',
        supplier: 'تولیدکننده لوازم منزل',
        price: 1800000,
        category: 'home',
        stock: 200,
        description: 'ست روتختی از جنس کتان با طراحی مدرن',
        image: '/pictures/products/bedding.jpg',
        minOrder: 3,
        approved: true,
    },
    
    // زیبایی و سلامت
    {
        name: 'کرم مرطوب‌کننده صورت',
        supplier: 'شرکت آرایشی بهداشتی',
        price: 650000,
        category: 'beauty',
        stock: 500,
        description: 'کرم مرطوب‌کننده با ویتامین E و SPF 30',
        image: '/pictures/products/moisturizer.jpg',
        minOrder: 6,
        approved: true,
    },
    {
        name: 'عطر زنانه فرانسوی',
        supplier: 'واردکننده عطر و ادکلن',
        price: 4200000,
        category: 'beauty',
        stock: 180,
        description: 'عطر زنانه با رایحه گل‌های بهاری و ماندگاری بالا',
        image: '/pictures/products/perfume-women.jpg',
        minOrder: 2,
        approved: true,
    },
    {
        name: 'ماسک صورت خاک رس',
        supplier: 'شرکت آرایشی بهداشتی',
        price: 380000,
        category: 'beauty',
        stock: 400,
        description: 'ماسک صورت از خاک رس طبیعی برای پاکسازی عمیق',
        image: '/pictures/products/face-mask.jpg',
        minOrder: 8,
        approved: true,
    },
    {
        name: 'رژ لب مات',
        supplier: 'واردکننده محصولات آرایشی',
        price: 550000,
        category: 'beauty',
        stock: 600,
        description: 'رژ لب مات با رنگ‌های متنوع و ماندگاری 8 ساعته',
        image: '/pictures/products/lipstick.jpg',
        minOrder: 10,
        approved: true,
    },
    
    // ورزش و سرگرمی
    {
        name: 'دوچرخه کوهستان',
        supplier: 'واردکننده دوچرخه',
        price: 15000000,
        category: 'sports',
        stock: 40,
        description: 'دوچرخه کوهستان با دنده 21 و ترمز دیسکی',
        image: '/pictures/products/bicycle.jpg',
        minOrder: 1,
        approved: true,
    },
    {
        name: 'مچ‌بند ورزشی هوشمند',
        supplier: 'واردکننده لوازم ورزشی',
        price: 3200000,
        category: 'sports',
        stock: 180,
        description: 'مچ‌بند هوشمند با ردیابی ضربان قلب و گام‌شمار',
        image: '/pictures/products/fitness-band.jpg',
        minOrder: 3,
        approved: true,
    },
    {
        name: 'توپ والیبال میکاسا',
        supplier: 'تولیدکننده لوازم ورزشی',
        price: 280000,
        category: 'sports',
        stock: 250,
        description: 'توپ والیبال استاندارد با کیفیت بالا',
        image: '/pictures/products/volleyball.jpg',
        minOrder: 5,
        approved: true,
    },
    {
        name: 'کمربند بدنسازی',
        supplier: 'تولیدکننده لوازم ورزشی',
        price: 450000,
        category: 'sports',
        stock: 300,
        description: 'کمربند بدنسازی چرمی با قابلیت تنظیم',
        image: '/pictures/products/gym-belt.jpg',
        minOrder: 3,
        approved: true,
    },
];

const addMoreProducts = async () => {
    try {
        // Connect to database
        await connectDB();

        console.log('Adding additional products...');
        const insertedProducts = await Product.insertMany(additionalProducts);
        console.log(`✓ Inserted ${insertedProducts.length} additional products`);

        const totalProducts = await Product.countDocuments({ approved: true });
        console.log(`\n✓ Total approved products in database: ${totalProducts}`);

        process.exit(0);
    } catch (error) {
        console.error('Error adding products:', error);
        process.exit(1);
    }
};

// Run
addMoreProducts();

