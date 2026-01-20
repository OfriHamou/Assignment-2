import request from "supertest";
import { Express } from "express";
import mongoose from "mongoose";
import initApp from "../index";
import User from "../models/userModel";

let app: Express;

const testUser = {
    username: "testuser",
    email: "testuser@example.com",
    password: "Test@1234",
    token : "",
    refreshToken : ""
};

beforeAll(async () => {
    app = await initApp();
    await User.deleteMany(); // Clear users collection before tests
});

afterAll(async () => {
    await mongoose.connection.close();
});

describe("Auth API Tests", () => {
    describe("POST /register", () => {
        test("should register a new user and return tokens", async () => {
            const response = await request(app)
                .post("/register")
                .send({
                    "username": testUser.username,
                    "email": testUser.email,
                    "password": testUser.password
                });

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty("token");
            expect(response.body).toHaveProperty("refreshToken");

            testUser.token = response.body.token;
            testUser.refreshToken = response.body.refreshToken;
        });

        test("should fail to register with existing email", async () => {
            const response = await request(app)
                .post("/register")
                .send({
                    "username": "anotheruser",
                    "email": testUser.email,
                    "password": "Another@1234"
                });
            expect(response.status).toBe(409);
        });
    });

    describe("POST /login", () => {
        test("should login and return tokens", async () => {
            const response = await request(app)
                .post("/login")
                .send({
                    "email": testUser.email,
                    "password": testUser.password
                });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("token");
            expect(response.body).toHaveProperty("refreshToken");

            testUser.token = response.body.token;
            testUser.refreshToken = response.body.refreshToken;
        });

        test("should fail to login with incorrect password", async () => {
            const response = await request(app)
                .post("/login")
                .send({
                    "email": testUser.email,
                    "password": "WrongPassword"
                });
            expect(response.status).toBe(401);
        });
    });

    describe("POST /refresh-token", () => {
        test("should refresh tokens", async () => {
            const response = await request(app)
                .post("/refresh-token")
                .send({
                    "refreshToken": testUser.refreshToken
                });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("token");
            expect(response.body).toHaveProperty("refreshToken");

            testUser.token = response.body.token;
            testUser.refreshToken = response.body.refreshToken;
        });

        test("should fail with old refresh token", async () => {
            const oldRefreshToken = testUser.refreshToken;

            // First refresh - should succeed
            const firstRefresh = await request(app)
                .post("/refresh-token")
                .send({ refreshToken: oldRefreshToken });
            expect(firstRefresh.status).toBe(200);
            testUser.refreshToken = firstRefresh.body.refreshToken;

            // Second refresh with old token - should fail
            const secondRefresh = await request(app)
                .post("/refresh-token")
                .send({ refreshToken: oldRefreshToken });
            expect(secondRefresh.status).toBe(401);
        });
    });

    describe("POST /logout", () => {
        beforeEach(async () => {
            // Login to get fresh tokens before each logout test
            const response = await request(app)
                .post("/login")
                .send({
                    "email": testUser.email,
                    "password": testUser.password
                });

            testUser.token = response.body.token;
            testUser.refreshToken = response.body.refreshToken;
        });

        test("should logout successfully", async () => {
            const response = await request(app)
                .post("/logout")
                .send({
                    "refreshToken": testUser.refreshToken
                });
            expect(response.status).toBe(200);
        });

        test("should fail to refresh token after logout", async () => {
            await request(app)
                .post("/logout")
                .send({
                    "refreshToken": testUser.refreshToken
                });

            const response = await request(app)
                .post("/refresh-token")
                .send({
                    "refreshToken": testUser.refreshToken
                });
            expect(response.status).toBe(401);
        });

        test("should fail to logout with invalid refresh token", async () => {
            const response = await request(app)
                .post("/logout")
                .send({
                    "refreshToken": "invalid.token.here"
                });
            expect(response.status).toBe(500);
        });
    });

    describe("POST /refresh-token", () => {
        test("should fail with missing refresh token", async () => {
            const response = await request(app)
                .post("/refresh-token")
                .send({});
            expect(response.status).toBe(400);
        });

        test("should fail with invalid refresh token format", async () => {
            const response = await request(app)
                .post("/refresh-token")
                .send({
                    "refreshToken": "invalid.token"
                });
            expect(response.status).toBe(500);
        });
    });
});