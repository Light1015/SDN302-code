require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/user.model');
const Product = require('./models/product.model');
const Review = require('./models/review.model');

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/review-app";

const seed = async () => {
    try {
        await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        // Xóa dữ liệu cũ
        await User.deleteMany({});
        await Product.deleteMany({});
        await Review.deleteMany({});

        // Tạo Users
        const users = await User.insertMany([
            { name: "Mai Lan", email: "lan@example.com" },
            { name: "Hoang Nam", email: "nam@example.com" }
        ]);

        // Tạo Products
        const products = await Product.insertMany([
            { name: "Laptop Dell XPS", description: "Màn hình 4K, Core i7" },
            { name: "Tai nghe Sony WH-1000XM4", description: "Noise Cancelling" }
        ]);

        // Tạo Reviews
        const review1 = new Review({
            rating: 5,
            comment: "Laptop chạy mượt, đáng tiền!",
            user: users[0]._id,
            product: products[0]._id
        });
        const review2 = new Review({
            rating: 4,
            comment: "Tai nghe bass mạnh, pin trâu",
            user: users[1]._id,
            product: products[1]._id
        });

        await review1.save();
        await review2.save();

        // Gắn reviews vào product
        products[0].reviews.push(review1._id);
        products[1].reviews.push(review2._id);

        await products[0].save();
        await products[1].save();

        console.log("✅ Seed thành công!");
        console.log("Users:", users.map(u => ({ id: u._id, name: u.name })));
        console.log("Products:", products.map(p => ({ id: p._id, name: p.name })));
        console.log("Reviews:", [review1._id, review2._id]);

        process.exit();
    } catch (err) {
        console.error("❌ Seed thất bại:", err);
        process.exit(1);
    }
};

seed();
