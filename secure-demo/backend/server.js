// backend/server.js
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const connectDB = require('./config/db');
require('./config/passport'); // optional; only if GOOGLE_* set

const authRoutes = require('./routes/authRoutes');
const User = require('./models/User');
const authMiddleware = require('./middleware/authMiddleware');

const app = express();
connectDB();

app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

// CORS: cho phép frontend http://localhost:3000 gửi cookie
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
  cookie: {
    maxAge: 1000 * 60 * 30, // 30 minutes
    httpOnly: true,
    secure: false, // true if https
    sameSite: 'lax'
  }
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/auth', authRoutes);

// protected route example
app.get('/api/user', (req, res) => {
  if (!req.user) return res.json({ user: null });
  res.json({ user: req.user.toSafeObject() });
});

app.get('/api/dashboard', authMiddleware, (req, res) => {
  res.json({ msg: 'Secret Data', user: req.user.toSafeObject() });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
