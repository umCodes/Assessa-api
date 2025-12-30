"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsePdf = parsePdf;
exports.ocrScanPdf = ocrScanPdf;
exports.convertPagesToImages = convertPagesToImages;
exports.clearUpUploadsFolder = clearUpUploadsFolder;
exports.digitCount = digitCount;
const pdf_parse_1 = __importDefault(require("pdf-parse"));
const fs_1 = __importDefault(require("fs"));
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const tesseract_js_1 = require("tesseract.js");
const node_poppler_1 = require("node-poppler");
const constriants_constants_1 = require("../constants/constriants.constants");
const http_error_1 = require("../errors/http-error");
async function parsePdf(file) {
    if (!file)
        throw new http_error_1.HttpError('No file uploaded', 400);
    const filePath = file.path;
    try {
        const buffer = fs_1.default.readFileSync(filePath);
        // console.log(filePath, file);
        const { text, numpages } = (await (0, pdf_parse_1.default)(buffer));
        //If file characters are bellow minimum length throw an error
        if (text.length < constriants_constants_1.minTextPdfCharLength)
            throw new http_error_1.HttpError(`File must have more than ${constriants_constants_1.minTextPdfCharLength} characters.`, 400);
        //If file pages exceed maximum number throw an error
        if (numpages > constriants_constants_1.maxNumOfPagesPerPdf)
            throw new http_error_1.HttpError(`Invalid number of pages. Maximum allowed number of pages is ${constriants_constants_1.maxNumOfPagesPerPdf} pages`, 400);
        fs_1.default.unlinkSync(filePath);
        return text.split(/\f/);
    }
    catch (error) {
        fs_1.default.unlinkSync(filePath);
        throw error;
    }
}
async function ocrScanPdf(file) {
    let text = '';
    let imagesFolder = '';
    if (!file)
        throw new http_error_1.HttpError('No file uploaded', 400);
    try {
        const { pages, imagesfolderPath } = await convertPagesToImages(file);
        imagesFolder = imagesfolderPath;
        for (let i = 1; i <= pages.new; i++) {
            const worker = await (0, tesseract_js_1.createWorker)();
            await worker.loadLanguage('eng');
            await worker.initialize('eng');
            const ImagePath = `${imagesfolderPath}/img-${"0".repeat(digitCount(pages.original) - digitCount(i)) + i.toString()}.png`;
            text += (await worker.recognize(ImagePath)).data.text;
            worker.terminate();
        }
        fs_1.default.unlinkSync(file.path); // delete uploaded pdf file
        fs_1.default.rmSync(imagesfolderPath, { recursive: true }); // delete images folder and its content
        return text.split(/\f/); // return text as array of strings split by new line
    }
    catch (error) {
        fs_1.default.unlinkSync(file.path); // delete uploaded pdf file
        fs_1.default.rmSync(imagesFolder, { recursive: true }); // delete images folder and its content
        throw error;
    }
}
async function convertPagesToImages(file) {
    if (!file)
        throw new http_error_1.HttpError('No file uploaded', 400);
    try {
        //Images folder path
        const filePath = file.path;
        const imagesFolderName = `${Math.floor(Math.random() * 100) + Date.now()}`;
        const outputDir = path_1.default.dirname(filePath);
        const imagesfolderPath = path_1.default.join(__dirname, '../../', outputDir, imagesFolderName);
        //Read PDF pages
        const buffer = fs_1.default.readFileSync(filePath);
        const { numpages } = await (0, pdf_parse_1.default)(buffer);
        const pdfFilePages = { new: numpages > 5 ? 5 : numpages, original: numpages };
        //Create the image pages folder
        fs_1.default.mkdirSync(imagesfolderPath);
        // Convert PDF → images    
        const poppler = new node_poppler_1.Poppler();
        await poppler.pdfToCairo(filePath, imagesfolderPath + "/img", { pngFile: true, lastPageToConvert: pdfFilePages.new });
        return { pages: pdfFilePages, imagesfolderPath };
    }
    catch (error) {
        console.log(error);
        throw error;
    }
}
async function clearUpUploadsFolder() {
    const uploadsFolderPath = path_1.default.resolve('./uploads');
    await promises_1.default.rm(uploadsFolderPath, { recursive: true, force: true });
    await promises_1.default.mkdir(uploadsFolderPath, { recursive: true }); // recreate uploads folder after deletion
}
//Calculates the number of digits of a Number
//Used to loop throug images folder
function digitCount(num) {
    return Math.floor(Math.log10(Math.abs(num)));
}
//Reason:  if the images folder has xxx number of images
//they will be stored by pdfPoppler as document-(001...xxx)
//for the i^th image in the folder the document will be named as document-00i, document-0ii, or document-iii. (ex. 35^th image --> document-035)
//# sourceMappingURL=files.js.map