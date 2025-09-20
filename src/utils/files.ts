import pdf from "pdf-parse";
import fs from 'fs';
import path from 'path';
import Tesseract from "tesseract.js";
import { Poppler } from "node-poppler";
import { maxClearUpPages, maxNumOfPagesPerPdf, minTextPdfCharLength } from "../constants/constriants.constants";
import { HttpError } from "../errors/http-error";


export async function parsePdf(file: Express.Multer.File | undefined){
    if(!file) throw new HttpError('No file uploaded', 400)
    const filePath = file.path;
    try{    
        const buffer = fs.readFileSync(filePath)
        // console.log(filePath, file);
        const {text, numpages} = (await pdf(buffer));


        //If file characters are bellow minimum length throw an error
        if(text.length < minTextPdfCharLength)  
            throw new HttpError(`File must have more than ${minTextPdfCharLength} characters.`, 400); 
        
        //If file pages exceed maximum number throw an error
        if(numpages > maxNumOfPagesPerPdf) 
            throw new HttpError(`Invalid number of pages. Maximum allowed number of pages is ${maxNumOfPagesPerPdf} pages`, 400); 


        
        fs.unlinkSync(filePath)
        return text.split(/\f/);
    }catch(error){
        throw error;
    }
}


export async function ocrScanPdf(file: Express.Multer.File | undefined, isClearup: boolean){
    
    if(!file) throw new HttpError('No file uploaded', 400)

    try{        
        
        //Images folder path
        const filePath = file.path;        
        const imagesFolderName = `${Math.floor(Math.random() * 100) + Date.now()}`; 
        const outputDir = path.dirname(filePath);
        const imagesfolderPath = path.join(__dirname, '../../', outputDir, imagesFolderName);
        
        //Read PDF pages
        const buffer = fs.readFileSync(filePath)
        const {numpages} = await pdf(buffer);
        const pdfFilePages = numpages > 10 && isClearup ? 10 : numpages;
        
        //Create the image pages folder
        fs.mkdirSync(imagesfolderPath)
    
        // Convert PDF → images    
        const poppler = new Poppler();
        await poppler.pdfToCairo(filePath, imagesfolderPath + "/img" , { pngFile: true, lastPageToConvert: pdfFilePages })
        

        //Loop through each image within the created images folder 
        let text = "";
        let promises = [];


        for(let i = 1; i <= pdfFilePages; i++){

            //Image path
            const ImagePath = `${imagesfolderPath}/img-${"0".repeat(digitCount(pdfFilePages) - digitCount(i)) + i.toString()}.png`
            console.log(ImagePath);
            
            //Extract text from image:
            const result = Tesseract.recognize(ImagePath, 'eng'); // To be awaited later in batch
            promises.push(result); // push promise to array

            //Process in batches of 10 or when the last batch (10 or less images) of images is reached
            if(i % 10 === 0 || i === pdfFilePages) {
                const results = await Promise.all(promises); // await all promises in the batch
                
                //Append text from batch to a single text string
                text += results.map(result => result.data.text).join("\f");
                promises = []; // empty promises for next batch
            }        
        
        }
        fs.unlinkSync(filePath); // delete uploaded pdf file
        fs.rmSync(imagesfolderPath, { recursive: true }); // delete images folder and its content
        return text.split(/\f/); // return text as array of strings split by new line
    }catch(error){
        throw error;
    }

}



//Calculates the number of digits of a Number
//Used to loop throug images folder
export function digitCount(num: number){
    return Math.floor(Math.log10(Math.abs(num)))
}
//Reason:  if the images folder has xxx number of images
//they will be stored by pdfPoppler as document-(001...xxx)
//for the i^th image in the folder the document will be named as document-00i, document-0ii, or document-iii. (ex. 35^th image --> document-035)
