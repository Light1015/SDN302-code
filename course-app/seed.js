require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/user.model');
const Course = require('./models/course.model');

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/course-app";

const seed = async () => {
    try {
        await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        // Xóa sạch dữ liệu cũ
        await User.deleteMany({});
        await Course.deleteMany({});

        // Tạo Users
        const users = await User.insertMany([
            { name: "Nguyen Van A", email: "a@example.com" },
            { name: "Tran Thi B", email: "b@example.com" }
        ]);

        // Tạo Courses
        const courses = await Course.insertMany([
            { title: "NodeJS cơ bản", description: "Học backend với Node" },
            { title: "MongoDB nâng cao", description: "Indexing, Aggregation, Sharding" }
        ]);

        // Cho user[0] đăng ký courses[0] + courses[1]
        users[0].enrolledCourses.push(courses[0]._id, courses[1]._id);
        courses[0].students.push(users[0]._id);
        courses[1].students.push(users[0]._id);

        // Cho user[1] đăng ký course[1]
        users[1].enrolledCourses.push(courses[1]._id);
        courses[1].students.push(users[1]._id);

        await users[0].save();
        await users[1].save();
        await courses[0].save();
        await courses[1].save();

        console.log("✅ Seed thành công!");
        console.log("Users:", users.map(u => ({ id: u._id, name: u.name, email: u.email })));
        console.log("Courses:", courses.map(c => ({ id: c._id, title: c.title })));

        process.exit();
    } catch (err) {
        console.error("❌ Seed thất bại:", err);
        process.exit(1);
    }
};

seed();
