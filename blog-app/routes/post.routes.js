const express = require('express');
const router = express.Router();
const Post = require('../models/post.model');
const Comment = require('../models/comment.model');
// Tạo bài viết
router.post('/', async (req, res) => {
    const { title, content, author } = req.body;
    const post = new Post({ title, content, author });
    await post.save();
    res.json(post);
});
// Lấy tất cả bài viết (kèm comment và user)
router.get('/', async (req, res) => {
    const posts = await Post.find()
        .populate('author', 'name')
        .populate({
            path: 'comments',
            populate: { path: 'user', select: 'name' }
        });
    res.json(posts);
});
module.exports = router;