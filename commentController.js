const Comment = require('../models/commentModel');

// Create a new comment
const createComment = async (req, res) => {
    try {
        const { content, sender, postId } = req.body;
        const newComment = new Comment({ content, sender, postId });
        await newComment.save();
        res.status(201).json(newComment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAllCommentsByPostId = async (req, res) => {
    try {
        const postId = req.query.postId;
        const comments = await Comment.find({ postId });
        res.status(200).json(comments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getCommentById = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.Id);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        res.status(200).json(comment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateCommentById = async (req, res) => {
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
        res.status(500).json({ message: error.message });
    }
};

const deleteCommentById = async (req, res) => {
    try {
        const deletedComment = await Comment.findByIdAndDelete(req.params.Id);
        if (!deletedComment) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        res.status(200).json({ message: 'Comment deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }  
};



module.exports = {
    createComment,
    getAllCommentsByPostId,
    getCommentById,
    updateCommentById,
    deleteCommentById,
};