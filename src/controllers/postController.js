const Post = require('../models/postModel');

// Create a new post
const createPost = async (req, res) => {
    try {
        const post = new Post(req.body);
        await post.save();
        res.status(201).json(post);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

//get all posts 
const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find();
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//get a post by id
const getPostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.status(200).json(post);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//get post by sender
const getPostsBySender = async (req, res) => {
    try {
        const posts = await Post.find({ sender: req.params.sender });
        if (!posts || posts.length === 0) {
            return res.status(404).json({ message: 'No posts found for this sender' });
        }
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//update a post by id
const updatePostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }   
        post.content = req.body.content || post.content;
        post.sender = req.body.sender || post.sender;
        await post.save();
        res.status(200).json(post);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }   
};

module.exports = {
    createPost,
    getAllPosts,
    getPostById,
    getPostsBySender,
    updatePostById
};
