import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/userModel";

const sendError = (code: number, message: string, res: Response) => {
    return res.status(code).json({ message });
};

type GeneratedTokens = {
    token: string;
    refreshToken: string;
};

const generateTokens = (userId: string): GeneratedTokens => {
    const secret = process.env.JWT_SECRET!;
    const expireIn = parseInt(process.env.JWT_EXPIRATION!);
    const token = jwt.sign(
        { _id: userId },
        secret,
        { expiresIn: expireIn }
    );

    const refreshSecret = process.env.JWT_REFRESH_SECRET!;
    const refreshExpireIn = parseInt(process.env.JWT_REFRESH_EXPIRATION!);
    const rand = Math.floor(Math.random() * 1000);
    const refreshToken = jwt.sign(
        { _id: userId, rand },
        refreshSecret,
        { expiresIn: refreshExpireIn }
    );

    return { token, refreshToken };
};

export const register = async (req: Request, res: Response) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return sendError(400, "Username, email and password are required", res);
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return sendError(409, "Email already in use", res);
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = await User.create({
            "username" : username,
            "email" : email,
            "password" : hashedPassword
        });

        const tokens = generateTokens(newUser._id.toString());
        newUser.refreshTokens.push(tokens.refreshToken);
        await newUser.save();
        res.status(201).json(tokens);
    } catch (error) {
        return sendError(500, "Error registering user", res);
    }
};

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return sendError(400, "Email and password are required", res);
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return sendError(401, "Invalid email or password", res);
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return sendError(401, "Invalid email or password", res);
        }

        const tokens = generateTokens(user._id.toString());
        user.refreshTokens.push(tokens.refreshToken);
        await user.save();
        res.status(200).json(tokens);
    } catch (error) {
        return sendError(500, "Error logging in", res);
    }
};

export const logout = async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return sendError(400, "Refresh token is required", res);
    }

    try {
        const userPayload = jwt.verify( refreshToken, process.env.JWT_REFRESH_SECRET! ) as { _id: string };
        const user = await User.findById(userPayload._id);
        if (!user) {
            return sendError(401, "Invalid refresh token", res);
        }

        if( !user.refreshTokens.includes(refreshToken) ) {
            user.refreshTokens = [];
            await user.save();
            console.log("**** Possible token theft detected for user ID: " + user._id);
            return sendError(401, "Invalid refresh token", res);
        } 

        user.refreshTokens = user.refreshTokens.filter( token => token !== refreshToken );
        await user.save();
        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        return sendError(500, "Error logging out", res);
    }  
};

export const refreshToken = async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return sendError(400, "Refresh token is required", res);
    }

    try {
        const userPayload = jwt.verify( refreshToken, process.env.JWT_REFRESH_SECRET! ) as { _id: string };
        const user = await User.findById(userPayload._id);
        if (!user) {
            return sendError(401, "Invalid refresh token", res);
        }

        if( !user.refreshTokens.includes(refreshToken) ) {
            user.refreshTokens = [];
            await user.save();
            console.log("**** Possible token theft detected for user ID: " + user._id);
            return sendError(401, "Invalid refresh token", res);
        }

        user.refreshTokens = user.refreshTokens.filter( token => token !== refreshToken );
        const tokens = generateTokens(user._id.toString());
        user.refreshTokens.push(tokens.refreshToken);
        await user.save();
        res.status(200).json(tokens);
    } catch (error) {
        return sendError(500, "Error refreshing token", res);
    }
};