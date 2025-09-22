require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const app = express();
app.use(express.json());
// Kết nối DB
connectDB();
// Routes
app.use('/users', require('./routes/user.routes'));
app.use('/posts', require('./routes/post.routes'));
app.use('/comments', require('./routes/comment.routes'));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));