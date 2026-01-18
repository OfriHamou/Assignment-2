import Comment from '../models/commentModel';
import { Request, Response } from 'express';


// Create a new comment
export const createComment = async (req: Request, res: Response) => {
    try {
        const newComment = new Comment(req.body);
        await newComment.save();
        res.status(201).json(newComment);
    } catch (error) {
        res.status(500).json({ message: 'Error creating comment', error } );
    }
};

export const getAllCommentsByPostId = async (req: Request, res: Response) => {
    try {
        const postId = req.query.postId;
        const comments = await Comment.find({ postId });
        res.status(200).json(comments);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving comments by postId', error } );
    }
};

export const getCommentById = async (req: Request, res: Response) => {
    try {
        const comment = await Comment.findById(req.params.Id);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        res.status(200).json(comment);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving comment by id', error } );
    }
};

export const updateCommentById = async (req: Request, res: Response) => {
    try {
        const updatedComment = await Comment.findByIdAndUpdate(
            req.params.Id,
            req.body,
            { new: true }
        );
        if (!updatedComment) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        res.status(200).json(updatedComment);
    } catch (error) {
        res.status(500).json({ message: 'Error updating comment by id', error } );
    }
};

export const deleteCommentById = async (req: Request, res: Response) => {
    try {
        const deletedComment = await Comment.findByIdAndDelete(req.params.Id);
        if (!deletedComment) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        res.status(200).json({ message: 'Comment deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting comment by id', error } );
    }  
};

export const getCommentsByUserId = async (req: Request, res: Response) => {
    try {
        const userId = req.params.userId;
        const comments = await Comment.find({ userId });
        res.status(200).json(comments);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving comments by userId', error } );
    }
};

