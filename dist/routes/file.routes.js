"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_middlewares_1 = __importDefault(require("../middlewares/multer.middlewares"));
const file_controllers_1 = require("../controllers/file.controllers");
const fileRouter = (0, express_1.Router)();
fileRouter.post('/pages', multer_middlewares_1.default, file_controllers_1.getPages);
exports.default = fileRouter;
//# sourceMappingURL=file.routes.js.map