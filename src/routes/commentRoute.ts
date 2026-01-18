import express from 'express';
import { 
    createComment,
    getAllCommentsByPostId,
    getCommentById,
    updateCommentById,
    deleteCommentById
} from '../controllers/commentController';
const router = express.Router();

router.post('/', createComment);
router.get('/', getAllCommentsByPostId);
router.get('/:Id', getCommentById);
router.put('/:Id', updateCommentById);
router.delete('/:Id', deleteCommentById);
export default router;