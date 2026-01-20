import express from 'express';
import { 
    createPost,
    getAllPosts,
    getPostById,
    getPostsByUser,
    updatePostById,
    deletePostById
} from '../controllers/postController';
import { authenticate } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', authenticate, createPost);
router.get('/', getAllPosts);
router.get('/:id', getPostById);
router.get('/user/:userID', getPostsByUser);
router.put('/:id', authenticate, updatePostById);
router.delete('/:id', authenticate, deletePostById);

export default router;