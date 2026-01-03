const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const Product = require('../models/Product');
const User = require('../models/User');

// Connect to database
const connectDB = require('../config/database');

// Sample products data
const products = [
    {
        name: 'لپ تاپ لنوو ThinkPad X1 Carbon',
        supplier: 'شرکت تکنولوژی پیشرو',
        price: 45000000,
        category: 'electronics',
        stock: 50,
        description: 'لپ تاپ حرفه‌ای با پردازنده Intel Core i7، 16GB RAM، 512GB SSD',
        image: '/pictures/laptop.jpg',
        minOrder: 1,
        approved: true,
    },
    {
        name: 'گوشی موبایل سامسونگ Galaxy S24',
        supplier: 'واردکننده موبایل',
        price: 35000000,
        category: 'electronics',
        stock: 100,
        description: 'گوشی هوشمند با دوربین 108 مگاپیکسل و صفحه نمایش 6.7 اینچی',
        image: '/pictures/phone.jpg',
        minOrder: 1,
        approved: true,
    },
    {
        name: 'تلویزیون سونی 55 اینچ 4K',
        supplier: 'توزیع‌کننده لوازم الکترونیکی',
        price: 25000000,
        category: 'electronics',
        stock: 30,
        description: 'تلویزیون هوشمند با وضوح 4K و سیستم عامل Android TV',
        image: '/pictures/tv.jpg',
        minOrder: 1,
        approved: true,
    },
    {
        name: 'تی‌شرت مردانه پنبه‌ای',
        supplier: 'کارخانه پوشاک تهران',
        price: 150000,
        category: 'clothing',
        stock: 500,
        description: 'تی‌شرت با کیفیت بالا از جنس پنبه 100%',
        image: '/pictures/tshirt.jpg',
        minOrder: 10,
        approved: true,
    },
    {
        name: 'شلوار جین مردانه',
        supplier: 'کارخانه پوشاک تهران',
        price: 350000,
        category: 'clothing',
        stock: 300,
        description: 'شلوار جین با کیفیت بالا و دوخت محکم',
        image: '/pictures/jeans.jpg',
        minOrder: 5,
        approved: true,
    },
    {
        name: 'کفش ورزشی نایک',
        supplier: 'واردکننده کفش ورزشی',
        price: 2500000,
        category: 'clothing',
        stock: 200,
        description: 'کفش ورزشی با کفی نرم و ضد تعریق',
        image: '/pictures/shoes.jpg',
        minOrder: 2,
        approved: true,
    },
    {
        name: 'برنج طارم ممتاز',
        supplier: 'تولیدکننده برنج شمال',
        price: 800000,
        category: 'food',
        stock: 1000,
        description: 'برنج طارم با کیفیت عالی و عطر و طعم بی‌نظیر',
        image: '/pictures/rice.jpg',
        minOrder: 10,
        approved: true,
    },
    {
        name: 'روغن آفتابگردان',
        supplier: 'کارخانه روغن‌کشی',
        price: 450000,
        category: 'food',
        stock: 800,
        description: 'روغن آفتابگردان خالص و بدون مواد افزودنی',
        image: '/pictures/oil.jpg',
        minOrder: 12,
        approved: true,
    },
    {
        name: 'چای ایرانی ممتاز',
        supplier: 'باغ چای شمال',
        price: 1200000,
        category: 'food',
        stock: 600,
        description: 'چای ایرانی با کیفیت عالی و عطر و طعم طبیعی',
        image: '/pictures/tea.jpg',
        minOrder: 5,
        approved: true,
    },
    {
        name: 'مبل راحتی 3 نفره',
        supplier: 'کارگاه مبلمان',
        price: 15000000,
        category: 'home',
        stock: 25,
        description: 'مبل راحتی با پارچه مخمل و اسکلت فلزی محکم',
        image: '/pictures/sofa.jpg',
        minOrder: 1,
        approved: true,
    },
    {
        name: 'میز ناهارخوری 6 نفره',
        supplier: 'کارگاه مبلمان',
        price: 8000000,
        category: 'home',
        stock: 40,
        description: 'میز ناهارخوری چوبی با کیفیت بالا',
        image: '/pictures/table.jpg',
        minOrder: 1,
        approved: true,
    },
    {
        name: 'یخچال ساید بای ساید سامسونگ',
        supplier: 'واردکننده لوازم خانگی',
        price: 18000000,
        category: 'home',
        stock: 20,
        description: 'یخچال ساید بای ساید با ظرفیت 600 لیتر',
        image: '/pictures/fridge.jpg',
        minOrder: 1,
        approved: true,
    },
    {
        name: 'کرم ضد آفتاب SPF 50',
        supplier: 'شرکت آرایشی بهداشتی',
        price: 450000,
        category: 'beauty',
        stock: 400,
        description: 'کرم ضد آفتاب با محافظت بالا و مناسب برای پوست حساس',
        image: '/pictures/sunscreen.jpg',
        minOrder: 6,
        approved: true,
    },
    {
        name: 'شامپو و نرم‌کننده 2 در 1',
        supplier: 'شرکت آرایشی بهداشتی',
        price: 280000,
        category: 'beauty',
        stock: 500,
        description: 'شامپو و نرم‌کننده با فرمول طبیعی',
        image: '/pictures/shampoo.jpg',
        minOrder: 10,
        approved: true,
    },
    {
        name: 'عطر مردانه',
        supplier: 'واردکننده عطر و ادکلن',
        price: 3500000,
        category: 'beauty',
        stock: 150,
        description: 'عطر مردانه با رایحه خوش و ماندگار',
        image: '/pictures/perfume.jpg',
        minOrder: 2,
        approved: true,
    },
    {
        name: 'توپ فوتبال',
        supplier: 'تولیدکننده لوازم ورزشی',
        price: 350000,
        category: 'sports',
        stock: 300,
        description: 'توپ فوتبال استاندارد با کیفیت بالا',
        image: '/pictures/football.jpg',
        minOrder: 5,
        approved: true,
    },
    {
        name: 'دمبل 5 کیلویی',
        supplier: 'تولیدکننده لوازم ورزشی',
        price: 450000,
        category: 'sports',
        stock: 200,
        description: 'دمبل چدنی با روکش ضد لغزش',
        image: '/pictures/dumbbell.jpg',
        minOrder: 2,
        approved: true,
    },
    {
        name: 'طناب ورزشی',
        supplier: 'تولیدکننده لوازم ورزشی',
        price: 120000,
        category: 'sports',
        stock: 400,
        description: 'طناب ورزشی با دسته‌های راحت و طناب محکم',
        image: '/pictures/rope.jpg',
        minOrder: 10,
        approved: true,
    },
];

// Sample buyers data
const buyers = [
    {
        name: 'علی احمدی',
        email: 'ali.ahmadi@example.com',
        phone: '09121234567',
        password: '123456',
        firstName: 'علی',
        lastName: 'احمدی',
        role: 'buyer',
    },
    {
        name: 'مریم رضایی',
        email: 'maryam.rezaei@example.com',
        phone: '09121234568',
        password: '123456',
        firstName: 'مریم',
        lastName: 'رضایی',
        role: 'buyer',
    },
    {
        name: 'حسین محمدی',
        email: 'hossein.mohammadi@example.com',
        phone: '09121234569',
        password: '123456',
        firstName: 'حسین',
        lastName: 'محمدی',
        role: 'buyer',
    },
    {
        name: 'فاطمه کریمی',
        email: 'fateme.karimi@example.com',
        phone: '09121234570',
        password: '123456',
        firstName: 'فاطمه',
        lastName: 'کریمی',
        role: 'buyer',
    },
    {
        name: 'محمد صادقی',
        email: 'mohammad.sadeghi@example.com',
        phone: '09121234571',
        password: '123456',
        firstName: 'محمد',
        lastName: 'صادقی',
        role: 'buyer',
    },
    {
        name: 'زهرا نوری',
        email: 'zahra.nouri@example.com',
        phone: '09121234572',
        password: '123456',
        firstName: 'زهرا',
        lastName: 'نوری',
        role: 'buyer',
    },
    {
        name: 'رضا حسینی',
        email: 'reza.hosseini@example.com',
        phone: '09121234573',
        password: '123456',
        firstName: 'رضا',
        lastName: 'حسینی',
        role: 'buyer',
    },
    {
        name: 'سارا علیزاده',
        email: 'sara.alizadeh@example.com',
        phone: '09121234574',
        password: '123456',
        firstName: 'سارا',
        lastName: 'علیزاده',
        role: 'buyer',
    },
    {
        name: 'امیر عباسی',
        email: 'amir.abbasi@example.com',
        phone: '09121234575',
        password: '123456',
        firstName: 'امیر',
        lastName: 'عباسی',
        role: 'buyer',
    },
    {
        name: 'نرگس موسوی',
        email: 'narges.mousavi@example.com',
        phone: '09121234576',
        password: '123456',
        firstName: 'نرگس',
        lastName: 'موسوی',
        role: 'buyer',
    },
];

const seedDatabase = async () => {
    try {
        // Connect to database
        await connectDB();

        // Clear existing data
        console.log('Clearing existing data...');
        await Product.deleteMany({});
        await User.deleteMany({ role: 'buyer' }); // Only delete buyers, keep suppliers and admins
        
        // Create admin user if doesn't exist
        let admin = await User.findOne({ role: 'admin' });
        if (!admin) {
            console.log('Creating admin user...');
            const adminPassword = 'admin123';
            const salt = await bcrypt.genSalt(10);
            const hashedAdminPassword = await bcrypt.hash(adminPassword, salt);
            admin = new User({
                name: 'مدیر سیستم',
                phone: '09100000000',
                password: hashedAdminPassword,
                role: 'admin',
            });
            await admin.save();
            console.log(`✓ Admin user created - Phone: ${admin.phone}, Password: ${adminPassword}`);
        }
        
        // Create or update sample supplier
        let supplier = await User.findOne({ role: 'supplier', phone: '09111111111' });
        if (!supplier) {
            console.log('Creating sample supplier...');
            const supplierPassword = 'supplier123';
            const salt = await bcrypt.genSalt(10);
            const hashedSupplierPassword = await bcrypt.hash(supplierPassword, salt);
            supplier = new User({
                name: 'شرکت تامین‌کننده نمونه',
                username: 'supplier1',
                phone: '09111111111',
                password: hashedSupplierPassword,
                role: 'supplier',
            });
            await supplier.save();
            console.log(`✓ Sample supplier created - Username: ${supplier.username}, Password: ${supplierPassword}`);
        } else {
            // Update existing supplier to add username if missing
            if (!supplier.username) {
                supplier.username = 'supplier1';
                await supplier.save();
                console.log(`✓ Updated existing supplier with username: supplier1`);
            } else {
                console.log(`✓ Supplier already exists with username: ${supplier.username}`);
            }
        }

        // Insert products
        console.log('Inserting products...');
        const insertedProducts = await Product.insertMany(products);
        console.log(`✓ Inserted ${insertedProducts.length} products`);

        // Hash passwords and insert buyers
        console.log('Inserting buyers...');
        const buyersWithHashedPasswords = await Promise.all(
            buyers.map(async (buyer) => {
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(buyer.password, salt);
                return {
                    ...buyer,
                    password: hashedPassword,
                };
            })
        );

        const insertedBuyers = await User.insertMany(buyersWithHashedPasswords);
        console.log(`✓ Inserted ${insertedBuyers.length} buyers`);

        console.log('\n✓ Database seeded successfully!');
        console.log(`\nSummary:`);
        console.log(`- Products: ${insertedProducts.length}`);
        console.log(`- Buyers: ${insertedBuyers.length}`);
        console.log(`\nAll buyers have password: 123456`);

        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

// Run seed
seedDatabase();





