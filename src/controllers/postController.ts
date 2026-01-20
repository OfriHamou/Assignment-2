import Post from '../models/postModel';
import { Request, Response } from 'express';


// Create a new post
export const createPost = async (req: Request, res: Response) => {
    try {
        const post = new Post(req.body);
        await post.save();
        res.status(201).json(post);
    } catch (error) {
        res.status(400).json({ message: 'Error creating post', error } );
    }
};

//get all posts 
export const getAllPosts = async (req: Request, res: Response) => {
    try {
        const posts = await Post.find();
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving posts', error } );
    }
};

//get a post by id
export const getPostById = async (req: Request, res: Response) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.status(200).json(post);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving post by id', error } );
    }
};

//get post by user
export const getPostsByUser = async (req: Request, res: Response) => {
    try {
        const posts = await Post.find({ userID: req.params.userID });
        if (!posts || posts.length === 0) {
            return res.status(404).json({ message: 'No posts found for this user' });
        }
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving posts by user', error } );
    }
};

//update a post by id
export const updatePostById = async (req: Request, res: Response) => {
    try {
        const post = await Post.findById(req.params.id)
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }   
        post.content = req.body.content || post.content;
        post.userID = req.body.userID || post.userID;
        await post.save();
        res.status(200).json(post);
    } catch (error) {
        res.status(500).json({ message: 'Error updating post by id', error } );
    }   
};

//delete a post by id
export const deletePostById = async (req: Request, res: Response) => {
    try {
        const post = await Post.findByIdAndDelete(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.status(200).json({ message: 'Post deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting post by id', error } );
    }  
};
