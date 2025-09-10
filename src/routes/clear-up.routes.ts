import { Router } from "express";
import upload from "../middlewares/multer.middlewares";
import { clearUpPaper } from "../controllers/clear-up.controllers";
import { processFile } from "../middlewares/file-processor.middlewares";

const clearUpRouter = Router();

clearUpRouter.post('/clearup', upload, processFile, clearUpPaper);

export default clearUpRouter;