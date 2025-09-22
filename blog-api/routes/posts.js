const express = require('express');
const router = express.Router();
const { createPost, getPostWithComments } = require('../controllers/postController');
router.post('/', createPost);
router.get('/:id', getPostWithComments);
module.exports = router;