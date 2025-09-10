import { Request, Response, NextFunction } from "express";
import { ocrScanPdf, parsePdf } from "../utils/files";
import pdf from "pdf-parse";
import fs from "fs";
import { HttpError } from "../errors/http-error";
import { creditsPerPage } from "../constants/credits.constants";


export interface CreditsRequest extends Request{
    credits?: number
}

export async function processFile(req: CreditsRequest, res: Response, next: NextFunction){
    req.body = JSON.parse(req.body.data);
    const { file, body } = req;
    const file_type = body.file_type as "image" | "text";

    
    try{
        if(!file) throw new HttpError('File not provided.', 400);
        console.log(body);
        
        const buffer = fs.readFileSync(file.path)
        const {numpages} = await pdf(buffer);

        let subject: string[] = [];
        if(file_type === "image") {
            subject = await ocrScanPdf(file)
            req.credits = Number((creditsPerPage.imagePDF * numpages).toFixed(2))
        }
        if(file_type === "text") {            
            subject = await parsePdf(file)
            req.credits = Number((creditsPerPage.textPDF * numpages).toFixed(2))

        }
        req.body.subject = subject;
        return next()
    }catch(error){
        return next(error);
    }
}
