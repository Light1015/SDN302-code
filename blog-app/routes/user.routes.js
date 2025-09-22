const express = require('express');
const router = express.Router();
const User = require('../models/user.model');

router.post('/', async (req, res) => {
    try {
        const { name, email } = req.body;
        const user = new User({ name, email });
        await user.save();
        res.status(201).json(user);
    } catch (err) {
        if (err.code === 11000) return res.status(400).json({ message: 'Email đã tồn tại' });
        res.status(500).json({ message: err.message });
    }
});

router.get('/', async (req, res) => {
    try {
        const users = await User.find().lean();
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
