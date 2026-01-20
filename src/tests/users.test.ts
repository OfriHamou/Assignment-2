import request from "supertest";
import e, { Express } from "express";
import mongoose from "mongoose";
import initApp from "../index";
import User from "../models/userModel";

let app: Express;

const testUser = {
    username: "test2user2",
    email: "test2user2@example.com",
    password: "password123",
    token : "",
    refreshToken : "",
    _id: ""
};

beforeAll(async () => {
    app = await initApp();
    await User.deleteMany(); // Clear users collection before tests

    //Register a user to get a valid token for further tests
    const response = await request(app)
        .post("/register")
        .send({
            "username": testUser.username,
            "email": testUser.email,
            "password": testUser.password
        });

    testUser.token = response.body.token;
    testUser.refreshToken = response.body.refreshToken;

    //Get the user ID
    const user = await User.findOne({ email: testUser.email });
    if (user) {
        testUser._id = user._id.toString();
    }
});

afterAll(async () => {
    await mongoose.connection.close();
});




describe("User API Tests", () => {
    describe("GET /users", () => {
        test("should get all users", async () => {
            const response = await request(app).get("/users");

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThan(0);
        });

        test("should not return password or refreshTokens", async () => {
            const response = await request(app).get("/users");

            expect(response.status).toBe(200);
            expect(response.body[0]).not.toHaveProperty("password");
            expect(response.body[0]).not.toHaveProperty("refreshTokens");
        });
    });

    describe("GET /users/:id", () => {
        test("should get user by ID", async () => {
            const response = await request(app).get(`/users/${testUser._id}`);

            expect(response.status).toBe(200);
            expect(response.body.username).toBe(testUser.username);
            expect(response.body.email).toBe(testUser.email);
        });

        test("should return 404 for non-existing user", async () => {
            const response = await request(app).get("/users/610c5f4f5311236168a109ca");
            expect(response.status).toBe(404);
        });
    });

    describe("PUT /users/:id", () => {
        test("should update user with valid token", async () => {
            const response = await request(app)
                .put(`/users/${testUser._id}`)
                .set("Authorization", `Bearer ${testUser.token}`)
                .send({ username: "updateduser" });

            expect(response.status).toBe(200);
            expect(response.body.username).toBe("updateduser");
        });

        test("should fail to update user without token", async () => {
            const response = await request(app)
                .put(`/users/${testUser._id}`)
                .send({ username: "shouldnotupdate" });
            expect(response.status).toBe(401);
        });

        test("should return 404 when updating non-existing user", async () => {
            const response = await request(app)
                .put("/users/610c5f4f5311236168a109ca")
                .set("Authorization", `Bearer ${testUser.token}`)
                .send({ username: "nonexisting" });
            expect(response.status).toBe(404);
        });
    });

    describe("DELETE /users/:id", () => {
        test("should fail to delete user without token", async () => {
            const response = await request(app)
                .delete(`/users/${testUser._id}`);
            expect(response.status).toBe(401);
        });

        test("should delete user with valid token", async () => {
            const response = await request(app)
                .delete(`/users/${testUser._id}`)
                .set("Authorization", `Bearer ${testUser.token}`);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe("User deleted successfully");
        });

        test("should return 404 for already deleted user", async () => {
            const response = await request(app)
                .delete(`/users/${testUser._id}`)
                .set("Authorization", `Bearer ${testUser.token}`);
            expect(response.status).toBe(404);
        });
    });
});