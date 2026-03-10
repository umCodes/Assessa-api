import pdf from "pdf-parse";
import fs from 'fs';
import { MAX_NUM_OF_PAGES_PER_PDF, MIN_TEXT_PDF_CHARS } from "../constants/constriants.constants";
import { HttpError } from "../errors/http-error";


export async function parsePdf(file: Express.Multer.File | undefined){
    if(!file) throw new HttpError('No file uploaded', 400)
    const filePath = file.path;
    try{    
        const buffer = fs.readFileSync(filePath)
        // console.log(filePath, file);
        const {text, numpages} = (await pdf(buffer));

        //If file characters are bellow minimum length throw an error
        if(text.length < MIN_TEXT_PDF_CHARS)  
            throw new HttpError(`File must have more than ${MIN_TEXT_PDF_CHARS} characters.`, 400); 
        
        //If file pages exceed maximum number throw an error
        if(numpages > MAX_NUM_OF_PAGES_PER_PDF) 
            throw new HttpError(`Invalid number of pages. Maximum allowed number of pages is ${MAX_NUM_OF_PAGES_PER_PDF} pages`, 400); 


        
        fs.unlinkSync(filePath)
        return text.split(/\f/);
    }catch(error){
        fs.unlinkSync(filePath)
        throw error;
    }
}


// Counts the digits in a number
// digitCount(5) --> 1
// digitCount(50) --> 2
// digitCount(100) --> 3

export function digitCount(num: number){
    return Math.floor(Math.log10(Math.abs(num)))
}
