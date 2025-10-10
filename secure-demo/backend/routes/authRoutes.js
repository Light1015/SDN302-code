// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/User');

// --- Local register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) return res.status(400).json({ msg: 'Missing fields' });
    // simple check
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ msg: 'Email already used' });

    const user = new User({ email, password, name });
    await user.save();
    // create session
    req.login(user, (err) => {
      if (err) return res.status(500).json({ msg: 'Login after register failed' });
      return res.status(201).json({ user: user.toSafeObject() });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// --- Local login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });
    const ok = await user.comparePassword(password);
    if (!ok) return res.status(400).json({ msg: 'Invalid credentials' });

    req.login(user, (err) => {
      if (err) return res.status(500).json({ msg: 'Login failed' });
      return res.json({ user: user.toSafeObject() });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// --- Logout
router.get('/logout', (req, res) => {
  req.logout(() => {
    req.session.destroy(() => {
      res.clearCookie('connect.sid');
      res.json({ msg: 'Logged out' });
    });
  });
});

// --- Google OAuth routes (optional)
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect('http://localhost:3000/dashboard'); // redirect to front-end
  });

module.exports = router;
