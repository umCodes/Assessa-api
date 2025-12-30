import { NextFunction, Request, Response } from "express";
import { UserPayload } from "../models/jwt.types";
export interface AuthRequest extends Request {
    user?: UserPayload;
}
export declare function refreshTokens(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function authenticateToken(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=auth-handler.middlewares.d.ts.map