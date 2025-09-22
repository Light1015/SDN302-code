const Comment = require("../models/comment.model");

exports.createComment = async (req, res) => {
    try {
        const comment = await Comment.create(req.body);
        res.status(201).json(comment);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.getComments = async (req, res) => {
    try {
        // populate user thông tin
        const comments = await Comment.find().populate("user", "name email");
        res.json(comments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// tìm comment theo regex (ví dụ chứa chữ)
exports.searchComments = async (req, res) => {
    try {
        const { keyword } = req.query;
        const regex = new RegExp(keyword, "i"); // i = case-insensitive
        const comments = await Comment.find({ content: regex }).populate("user");
        res.json(comments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
