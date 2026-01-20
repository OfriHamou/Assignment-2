import request from "supertest";
import { Express } from "express";
import mongoose from "mongoose";
import initApp from "../index";
import User from "../models/userModel";
import Post from "../models/postModel";
import Comment from "../models/commentModel";

let app: Express;


const testUser = {
    username: "commentTestUser",
    email: "commenttest@example.com",
    password: "password123",
    token: "",
    refreshToken: "",
    _id: ""
};

const testPost = {
    content: "This is a test post for comments",
    _id: ""
};

const testComment = {
    content: "This is a test comment",
    _id: ""
};

beforeAll(async () => {
    // 1. Initialize the Express app
    app = await initApp();
    
    // 2. Clear database to start fresh
    await User.deleteMany();
    await Post.deleteMany();
    await Comment.deleteMany();
    
    // 3. Register a test user (comments need an owner)
    const registerResponse = await request(app)
        .post("/register")
        .send({
            username: testUser.username,
            email: testUser.email,
            password: testUser.password
        });
    
    // 4. Save authentication tokens
    testUser.token = registerResponse.body.token;
    testUser.refreshToken = registerResponse.body.refreshToken;
    
    // 5. Get the user's MongoDB _id
    const user = await User.findOne({ email: testUser.email });
    if (user) {
        testUser._id = user._id.toString();
    }
    
    // 6. Create a test post (comments need a post to attach to)
    const postResponse = await request(app)
        .post("/posts")
        .set("Authorization", `Bearer ${testUser.token}`)
        .send({
            content: testPost.content,
            userID: testUser._id
        });
    
    // 7. Save the post ID
    testPost._id = postResponse.body._id;
});

afterAll(async () => {
    await mongoose.connection.close();
});

describe("Comments API Tests", () => {
    describe("POST /comments", () => {
        test("should create a new comment with valid token", async () => {
            const response = await request(app)
                .post("/comments")
                .set("Authorization", `Bearer ${testUser.token}`)
                .send({
                    content: testComment.content,
                    postId: testPost._id,
                    userId: testUser._id
                }); 
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty("_id");
            expect(response.body.content).toBe(testComment.content);
            expect(response.body.postId).toBe(testPost._id);
            expect(response.body.userId).toBe(testUser._id);
            testComment._id = response.body._id; // Save comment ID for later tests
        });
        test("should fail to create a comment without token", async () => {
            const response = await request(app)
                .post("/comments")
                .send({
                    content: testComment.content,
                    postId: testPost._id,
                    userId: testUser._id
                });
            expect(response.status).toBe(401);
        });
        test("should fail to create comment without content", async () => {
            const response = await request(app)
                .post("/comments")
                .set("Authorization", `Bearer ${testUser.token}`)
                .send({
                    userId: testUser._id,
                    postId: testPost._id
                    // Missing content field
                });
            
            expect(response.status).toBe(500);  
        });
        
        test("should fail to create comment without postId", async () => {
            const response = await request(app)
                .post("/comments")
                .set("Authorization", `Bearer ${testUser.token}`)
                .send({
                    content: "Comment without post",
                    userId: testUser._id
                    // Missing postId field
                });
            
            expect(response.status).toBe(500);  
        });
    });  
    describe("GET /comments by postId", () => {
        test("should get all comments for a specific post", async () => {
            const response = await request(app)
                .get("/comments")
                .query({ postId: testPost._id });
            
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThan(0);
            expect(response.body[0].postId).toBe(testPost._id);
        });
        
        test("should return empty array for post with no comments", async () => {
            // Create another post without comments
            const newPostResponse = await request(app)
                .post("/posts")
                .set("Authorization", `Bearer ${testUser.token}`)
                .send({
                    content: "Post with no comments",
                    userID: testUser._id
                });
            
            const newPostId = newPostResponse.body._id;
            
            const response = await request(app)
                .get("/comments")
                .query({ postId: newPostId });
            
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBe(0);
        });
    });
    describe("GET /comments/:id", () => {
        test("should get comment by ID", async () => {
            const response = await request(app).get(`/comments/${testComment._id}`);
            expect(response.status).toBe(200);
            expect(response.body._id).toBe(testComment._id);
            expect(response.body.content).toBe(testComment.content);
            expect(response.body.postId).toBe(testPost._id);
        });
        test("should return 404 for non-existing comment", async () => {
            const fakeId = "610c5f4f5311236168a109ca";
            const response = await request(app).get(`/comments/${fakeId}`);
            expect(response.status).toBe(404);
        });
    });
    describe("PUT /comments/:id", () => {
        test("should update comment with valid token", async () => {
            const updatedContent = "This is updated comment content";
            
            const response = await request(app)
                .put(`/comments/${testComment._id}`)
                .set("Authorization", `Bearer ${testUser.token}`)
                .send({
                    content: updatedContent
                });
            
            expect(response.status).toBe(200);
            expect(response.body.content).toBe(updatedContent);
        });
        test("should fail to update comment without token", async () => {
            const response = await request(app)
                .put(`/comments/${testComment._id}`)
                .send({
                    content: "This update should fail, shouldnt update"
                });
            expect(response.status).toBe(401);
        }); 
        test("should return 404 when updating non-existing comment", async () => {
            const fakeId = "610c5f4f5311236168a109ca";
            const response = await request(app)
                .put(`/comments/${fakeId}`)
                .set("Authorization", `Bearer ${testUser.token}`)
                .send({
                    content: "Trying to update non existing comment"
                });
            expect(response.status).toBe(404);
        });
    });
    describe("DELETE /comments/:id", () => {
        test("should delete comment with valid token", async () => {
            const response = await request(app)
                .delete(`/comments/${testComment._id}`)
                .set("Authorization", `Bearer ${testUser.token}`);
            expect(response.status).toBe(200);
            expect(response.body.message).toBe("Comment deleted successfully");
        });
        test("should confirm comment is deleted", async () => {
            const response = await request(app)
                .get(`/comments/${testComment._id}`);
            
            expect(response.status).toBe(404);
        });
        test("should fail to delete comment without token", async () => {
            // Create a new comment to test delete protection
            const createResponse = await request(app)
                .post("/comments")
                .set("Authorization", `Bearer ${testUser.token}`)
                .send({
                    content: "Comment to test delete protection",
                    userId: testUser._id,
                    postId: testPost._id
                });
            
            const commentId = createResponse.body._id;
            
            // Try to delete without token
            const response = await request(app)
                .delete(`/comments/${commentId}`);
            
            expect(response.status).toBe(401);
        });
    }); 
});