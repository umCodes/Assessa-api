import Tesseract  from 'tesseract.js';
import {mkdir, readdir, readFile, rm, rmdir} from 'fs/promises'
import path from "path"
import { log as print} from 'console';
import {Poppler} from "node-poppler"
import pdf from "pdf-parse";
import { HttpError } from '../errors/http-error';
import { MAX_CLEARUP_PAGES } from '../constants/constriants.constants';
import { processImg } from '../services/gemini.services';
// ---- utility functions ------- 
function digitCount(num: number){
    return num.toString().length
}

function isPDF(buffer: Buffer): boolean {
  return buffer.slice(0, 4).toString() === '%PDF';
}



const scheduler = Tesseract.createScheduler();

async function init(){
    const worker = await Tesseract.createWorker();
    await worker.loadLanguage('eng+ara');
    await worker.initialize('eng+ara'); 
    scheduler.addWorker(worker);    
}    

const poppler = new Poppler();
const ready = init()


async function pdfToImg(filepath: string) {    
    const file = await readFile(filepath)
   
    if(!isPDF(file)) throw new HttpError("File provided is not a PDF.", 400)

    const {numpages} = await pdf(file)    
    if(numpages > MAX_CLEARUP_PAGES) throw new HttpError("File exceeds allowed number of pages.", 400)

    
    const filename = path.basename(filepath, '.pdf')    
    const folderName = `${filename}-${Date.now()}`
    const outputFile = path.join(process.cwd(), "uploads", folderName);
  
    await mkdir(outputFile)
    const options = {
        firstPageToConvert: 1,
        lastPageToConvert: numpages,
        pngFile: true,
        resolutionXYAxis: 300,
    };    

    await poppler.pdfToCairo(filepath, outputFile + "/image", options);
    console.log(filepath)
    await rm(filepath)
    
    return {
        imgRootPath: "uploads/" + folderName,
        imagesName: "image",
        pages: numpages
    }    

}        

function createJobPromises(pages: number, imgRootPath: string){
    return Array.from({ length: pages }, (_, i) => {
    
    const page = i + 1    
    const zeros = digitCount(pages) - digitCount(page)
    const imageNumber = "0".repeat(zeros) + (page).toString();
    
    const imagePath = `image-${imageNumber}.png`
    const fullPath = path.join(process.cwd(), imgRootPath, imagePath);    
    // return scheduler.addJob('recognize', fullPath);
    return processImg(fullPath);
  });  
}  


async function clearUpUploadsFolder(imgsFolder: string){
    
    
    const uploadsFolderPath = path.resolve(imgsFolder);
    await rm(uploadsFolderPath, { recursive: true, force: true });
 }

 export async function ocrScan(filepath: string){
    await ready;
    
    if(!filepath) throw new HttpError("File path not provided.", 400) 
    const {imgRootPath, pages} = await pdfToImg(filepath)
    const promises = createJobPromises(pages, imgRootPath)
    
    const draft  = await Promise.all(promises).catch(async () => {
        await clearUpUploadsFolder(imgRootPath)
        throw new HttpError('A problem occurred while scanning your file.', 500);
    });  
    await clearUpUploadsFolder(imgRootPath)

    // return draft.map(d => d.data.text)
    return draft
}    






