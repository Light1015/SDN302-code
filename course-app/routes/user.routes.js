const express = require('express');
const router = express.Router();
const User = require('../models/user.model');

// Create user
router.post('/', async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        res.status(201).json(user);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Get courses of a user (populate)
router.get('/:id/courses', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .populate('enrolledCourses', 'title description')
            .lean();
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user.enrolledCourses);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
