import express from 'express';
import { 
    createComment,
    getAllCommentsByPostId,
    getCommentById,
    updateCommentById,
    deleteCommentById
} from '../controllers/commentController';
import { authenticate } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', authenticate, createComment);
router.get('/', getAllCommentsByPostId);
router.get('/:Id', getCommentById);
router.put('/:Id', authenticate, updateCommentById);
router.delete('/:Id', authenticate, deleteCommentById);
export default router;