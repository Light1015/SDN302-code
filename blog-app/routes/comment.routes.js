const express = require('express');
const router = express.Router();
const Comment = require('../models/comment.model');

router.post('/', async (req, res) => {
    try {
        const { text, post, user } = req.body;
        const comment = new Comment({ text, post, user });
        await comment.save();
        res.status(201).json(comment);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
