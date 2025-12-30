"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processFile = processFile;
const files_1 = require("../utils/files");
const pdf_parse_1 = __importDefault(require("pdf-parse"));
const fs_1 = __importDefault(require("fs"));
const http_error_1 = require("../errors/http-error");
const credits_constants_1 = require("../constants/credits.constants");
async function processFile(req, res, next) {
    const { file, body } = req;
    const file_type = body.file_type;
    try {
        if (!file)
            throw new http_error_1.HttpError('File not provided.', 400);
        console.log(body);
        const buffer = fs_1.default.readFileSync(file.path);
        const { numpages } = await (0, pdf_parse_1.default)(buffer);
        let subject = [];
        console.log(req.path);
        if (file_type === "image" && req.path === "/clearup") {
            subject = await (0, files_1.ocrScanPdf)(file);
            req.credits = Number((credits_constants_1.creditsPerPage.imagePDF * numpages).toFixed(2));
        }
        if (file_type === "text") {
            subject = await (0, files_1.parsePdf)(file);
            req.credits = Number((credits_constants_1.creditsPerPage.textPDF * numpages).toFixed(2));
        }
        if (subject.length === 0)
            throw new http_error_1.HttpError('No text extracted from file.', 400);
        req.body.subject = subject;
        return next();
    }
    catch (error) {
        return next(error);
    }
}
//# sourceMappingURL=file-processor.middlewares.js.map