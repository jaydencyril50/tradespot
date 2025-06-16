import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export default function authenticateAdmin(req: Request, res: Response, next: NextFunction): void {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        res.status(401).json({ error: 'No token provided' });
        return;
    }
    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
        if (err || !user || !user.admin) {
            res.status(403).json({ error: 'Admin access required' });
            return;
        }
        (req as any).admin = user;
        next();
    });
}
