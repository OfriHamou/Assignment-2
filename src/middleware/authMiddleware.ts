import {Request, Response, NextFunction} from 'express';
import jwt from 'jsonwebtoken';

export type AuthRequest = Request & { userId?: string };

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }
    try {
        const secret = process.env.JWT_SECRET!;
        const decoded = jwt.verify(token, secret) as { _id: string };
        req.userId = decoded._id;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }  
};