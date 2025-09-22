const express = require('express');
const router = express.Router();
const { createUser, searchUser } = require('../controllers/userController');
router.post('/', createUser);
router.get('/search', searchUser);
module.exports = router;