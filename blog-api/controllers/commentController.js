const Comment = require('../models/Comment');
const Post = require('../models/Post');
exports.createComment = async (req, res) => {
    const comment = await Comment.create(req.body);
    await Post.findByIdAndUpdate(req.body.post, {
        $push: { comments: comment._id }
    });
    res.status(201).json(comment);
};