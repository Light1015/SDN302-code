const express = require('express');
const cors = require('cors');
const dotnenv = require('dotenv');
const connectDB = require('./config/db');

dotnenv.config();

// Connect to the database
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Define routes
app.use('/employees', require('./routes/employeeRoutes'));

app.listen(process.env.PORT || 5000, () => {
    console.log(`Server is running on port ${process.env.PORT || 5000}`);
});