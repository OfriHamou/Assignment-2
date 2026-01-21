import request from "supertest";
import { Express } from "express";
import mongoose from "mongoose";
import initApp from "../index";
import User from "../models/userModel";
import Post from "../models/postModel";

let app: Express;

const testUser = {
    username: "testuser",
    email: "testuser@example.com",
    password: "Test@1234",
    token : "",
    refreshToken : "",
    _id: ""
};

const testPost = {
    content: "This is a test post",
    _id:""
};

beforeAll(async () => {
    app = await initApp();
    await User.deleteMany(); // Clear users collection before tests
    await Post.deleteMany(); // Clear posts collection before tests

    // Register and login test user to get tokens
    const registerResponse = await request(app)
        .post("/register")
        .send({
            "username": testUser.username,
            "email": testUser.email,
            "password": testUser.password
        });
    testUser.token = registerResponse.body.token;
    testUser.refreshToken = registerResponse.body.refreshToken;

        // 5. Get the user ID (needed for creating posts)
    const user = await User.findOne({ email: testUser.email });
    if (user) {
        testUser._id = user._id.toString();
    }


});

afterAll(async () => {
    await mongoose.connection.close();
});


describe("Posts API Tests", () => {
    describe("POST /posts", () => {
        test("should create a new post with valid token", async () => {
            const response = await request(app)
                .post("/posts")
                .set("Authorization", `Bearer ${testUser.token}`)
                .send({
                    content: testPost.content,
                    userID: testUser._id
                });
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty("_id");
            expect(response.body.content).toBe(testPost.content);
            testPost._id = response.body._id; // Save post ID for later tests
        });

        test("should fail to create a post without token", async () => {
            const response = await request(app)
                .post("/posts")
                .send({
                    content: "Unauthorized post, this should fail",
                    userID: testUser._id
                });
            expect(response.status).toBe(401);
        });

        test("should fail to create a post with invalid token", async () => {
            const response = await request(app)
                .post("/posts")
                .set("Authorization", "Bearer invalid.token.here")
                .send({
                    content: "Post with invalid token",
                    userID: testUser._id
                });
            expect(response.status).toBe(401);
        });

        test("should fail to create a post with malformed authorization header", async () => {
            const response = await request(app)
                .post("/posts")
                .set("Authorization", "InvalidFormat")
                .send({
                    content: "Post with malformed header",
                    userID: testUser._id
                });
            expect(response.status).toBe(401);
        });
    });
    describe("GET /posts", () => {
        test("should get all posts", async () => {
            const response = await request(app).get("/posts");
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThan(0);
        });
    });
    describe("GET /posts/:id", () => {
        test("should get post by ID", async () => {
            const response = await request(app).get(`/posts/${testPost._id}`);
            expect(response.status).toBe(200);
            expect(response.body._id).toBe(testPost._id);
            expect(response.body.content).toBe(testPost.content);
        });
        test("should return 404 for non-existing post", async () => {
            const fakeId = "610c5f4f5311236168a109ca";
            const response = await request(app).get(`/posts/${fakeId}`);
            expect(response.status).toBe(404);
        });
        test("should return 500 for invalid post ID format", async () => {
            const invalidId = "invalid-id-format";
            const response = await request(app).get(`/posts/${invalidId}`);
            expect(response.status).toBe(500);
        });
    });
    describe("GET /posts by userID", () => {
        test("should get posts by userID", async () => {
            const response = await request(app).get(`/posts/user/${testUser._id}`);
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThan(0);
        });
        test("should return 404 when no posts found for user", async () => {
            const fakeUserId = "610c5f4f5311236168a109ca";
            const response = await request(app).get(`/posts/user/${fakeUserId}`);
            expect(response.status).toBe(404);
        });
    });
    describe("PUT /posts/:id", () => {
        test("should update post with valid token", async () => {
            const updatedContent = "This is the updated test post content";
            const response = await request(app)
                .put(`/posts/${testPost._id}`)
                .set("Authorization", `Bearer ${testUser.token}`)
                .send({ content: updatedContent });
            expect(response.status).toBe(200);
            expect(response.body.content).toBe(updatedContent);
        });

        test("should fail to update post without token", async () => {
            const response = await request(app)
                .put(`/posts/${testPost._id}`)
                .send({ content: "This update should fail" });
            expect(response.status).toBe(401);
        }); 
        test("should return 404 when updating non-existing post", async () => {
            const fakeId = "610c5f4f5311236168a109ca";
            const response = await request(app)
                .put(`/posts/${fakeId}`)
                .set("Authorization", `Bearer ${testUser.token}`)
                .send({ content: "Non-existing post update" });
            expect(response.status).toBe(404);
        });

        test("should return 500 for invalid post ID format in update", async () => {
            const invalidId = "invalid-id";
            const response = await request(app)
                .put(`/posts/${invalidId}`)
                .set("Authorization", `Bearer ${testUser.token}`)
                .send({ content: "Update with invalid ID" });
            expect(response.status).toBe(500);
        });
    });
    describe("DELETE /posts/:id", () => {
        test("should delete post with valid token", async () => {
            const response = await request(app)
                .delete(`/posts/${testPost._id}`)
                .set("Authorization", `Bearer ${testUser.token}`);
            expect(response.status).toBe(200);
        });
        test("should confirm post deletion", async () => {
            const response = await request(app).get(`/posts/${testPost._id}`);
            expect(response.status).toBe(404);
        });
        test("should fail to delete post without token", async () => {
            const response = await request(app)
                .delete(`/posts/${testPost._id}`);
            expect(response.status).toBe(401);
        });

        test("should return 500 for invalid post ID format in delete", async () => {
            const invalidId = "invalid-id";
            const response = await request(app)
                .delete(`/posts/${invalidId}`)
                .set("Authorization", `Bearer ${testUser.token}`);
            expect(response.status).toBe(500);
        });
    });
});