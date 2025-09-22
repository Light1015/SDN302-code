require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const app = express();
app.use(express.json());

connectDB();

app.use('/products', require('./routes/product.routes'));
app.use('/reviews', require('./routes/review.routes'));
// app.use('/users', require('./routes/user.routes')); // nếu bạn tạo user route giống bài 2

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running at ${PORT}`));
