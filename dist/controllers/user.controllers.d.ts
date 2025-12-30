import { NextFunction, Request, Response } from "express";
import { AuthRequest } from "../middlewares/auth-handler.middlewares";
export declare function getUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
export declare function sendFeedback(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function updateUserName(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=user.controllers.d.ts.map