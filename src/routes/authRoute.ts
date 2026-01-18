import { Express } from "express";
import { register, login, refreshToken, logout } from "../controllers/authController";

const authRoute = (app: Express) => {
    app.post('/register', register);
    app.post('/login', login);
    app.post('/refresh-token', refreshToken);
    app.post('/logout', logout);
}

export default authRoute;