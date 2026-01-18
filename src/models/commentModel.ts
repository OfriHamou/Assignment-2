import mongoose from 'mongoose';
import { ref } from 'node:process';

const commentSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true 
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true,
    },
}); 

export default mongoose.model('Comment', commentSchema);