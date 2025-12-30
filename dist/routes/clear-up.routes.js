"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_middlewares_1 = __importDefault(require("../middlewares/multer.middlewares"));
const clear_up_controllers_1 = require("../controllers/clear-up.controllers");
const file_processor_middlewares_1 = require("../middlewares/file-processor.middlewares");
const clearUpRouter = (0, express_1.Router)();
clearUpRouter.post('/clearup', multer_middlewares_1.default, file_processor_middlewares_1.processFile, clear_up_controllers_1.clearUpPaper);
exports.default = clearUpRouter;
//# sourceMappingURL=clear-up.routes.js.map