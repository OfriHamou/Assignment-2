const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

router.post('/', postController.createPost);
router.get('/', postController.getAllPosts);
router.get('/:id', postController.getPostById);
router.get('/sender/:sender', postController.getPostsBySender);
router.put('/:id', postController.updatePostById);

module.exports = router;