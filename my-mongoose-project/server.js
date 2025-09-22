const express = require('express');
const mongoose = require('mongoose'); require('dotenv').config();
const app = express(); const port = process.env.PORT || 5000;
// Kết nối với MongoDB mongoose.connect(process.env.MONGO_URI, {
// useNewUrlParser: true,
// useUnifiedTopology: true
// }).then(() => {
// console.log('MongoDB connected');
// }).catch(err => {
// console.error('MongoDB connection error:', err);
// });

// // Middleware app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// // Route mẫu app.get('/', (req, res) => {
// res.send('Hello, Mongoose!');
// });
// Khởi động server app.listen(port, () => {
// console.log(`Server listening on port ${port}`); });