const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');

router.post('/', commentController.createComment);
router.get('/', commentController.getAllCommentsByPostId);
router.get('/:Id', commentController.getCommentById);
router.put('/:Id', commentController.updateCommentById);
router.delete('/:Id', commentController.deleteCommentById);

module.exports = router;