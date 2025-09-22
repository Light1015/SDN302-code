const Post = require('../models/Post');
exports.createPost = async (req, res) => {
    const post = await Post.create(req.body);
    res.status(201).json(post);
};
exports.getPostWithComments = async (req, res) => {
    const post = await Post.findById(req.params.id)
        .populate('author')
        .populate({
            path: 'comments',
            populate: { path: 'user' }
        });
    res.json(post);
};