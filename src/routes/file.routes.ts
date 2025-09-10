import { Router } from "express";
import upload from "../middlewares/multer.middlewares";
import { getPages } from "../controllers/file.controllers";

const fileRouter = Router();

fileRouter.post('/pages', upload ,getPages);

export default fileRouter;