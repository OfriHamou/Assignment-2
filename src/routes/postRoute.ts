import express from 'express';
import { 
    createPost,
    getAllPosts,
    getPostById,
    getPostsByUser,
    updatePostById,
    deletePostById
} from '../controllers/postController';

const router = express.Router();

router.post('/', createPost);
router.get('/', getAllPosts);
router.get('/:id', getPostById);
router.get('/user/:userID', getPostsByUser);
router.put('/:id', updatePostById);
router.delete('/:id', deletePostById);

export default router;