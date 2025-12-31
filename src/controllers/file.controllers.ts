import { NextFunction, Request, Response } from "express";
import fs from 'fs/promises';
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
        const file = await fs.readFile(filePath);
        //Read Pdf Content
        const data = await pdf(file);
        //return number of pages 
        res.status(200).json({
            pages: data.text.split(/\f/).length
        })         
        await fs.unlink(filePath); 
        return;
    }catch(error){
        console.error('🔴 Error getting pages at ./controllers/file.controllers.ts -> getPages(): ', error);
        return next(error)
    }
}
