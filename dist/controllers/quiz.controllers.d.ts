import { NextFunction, Response } from "express";
import { AuthRequest } from "../middlewares/auth-handler.middlewares";
import { CreditsRequest } from "../middlewares/file-processor.middlewares";
export declare function getTotalQuizzes(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
export declare function getQuizzes(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
export declare function getQuiz(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
export declare function deleteQuiz(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
export declare function createQuiz(req: AuthRequest & CreditsRequest, res: Response, next: NextFunction): Promise<void>;
export declare function checkQuestionAnswer(req: AuthRequest & CreditsRequest, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=quiz.controllers.d.ts.map