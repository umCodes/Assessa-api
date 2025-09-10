import { NextFunction, Request, Response } from "express";
import fs from 'fs';
import pdf from 'pdf-parse'


export async function getPages(req: Request, res: Response, next: NextFunction) {

    try{        
        if(!req.file) {
            res.json({
                pages: 0
            })
            return;
        }
        //Read File's Content
        const filePath = req.file.path;
        const file = fs.readFileSync(filePath);
        //Read Pdf Content
        const { numpages } = await pdf(file);
        //return number of pages 
        res.status(200).json({
            pages: numpages
        })         
        fs.unlinkSync(filePath); 
        return;
    }catch(error){
        console.error('🔴 Error getting pages at ./controllers/file.controllers.ts -> getPages(): ', error);
        return next(error)
    }
}