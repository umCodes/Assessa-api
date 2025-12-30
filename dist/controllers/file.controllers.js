"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPages = getPages;
const fs_1 = __importDefault(require("fs"));
const pdf_parse_1 = __importDefault(require("pdf-parse"));
async function getPages(req, res, next) {
    try {
        if (!req.file) {
            res.json({
                pages: 0
            });
            return;
        }
        //Read File's Content
        const filePath = req.file.path;
        const file = fs_1.default.readFileSync(filePath);
        //Read Pdf Content
        const { numpages } = await (0, pdf_parse_1.default)(file);
        //return number of pages 
        res.status(200).json({
            pages: numpages
        });
        fs_1.default.unlinkSync(filePath);
        return;
    }
    catch (error) {
        console.error('🔴 Error getting pages at ./controllers/file.controllers.ts -> getPages(): ', error);
        return next(error);
    }
}
//# sourceMappingURL=file.controllers.js.map