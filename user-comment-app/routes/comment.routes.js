const express = require("express");
const { createComment, getComments, searchComments } = require("../controllers/comment.controller");
const router = express.Router();

router.post("/", createComment);
router.get("/", getComments);
router.get("/search", searchComments);

module.exports = router;
