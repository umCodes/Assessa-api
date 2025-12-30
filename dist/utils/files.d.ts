export declare function parsePdf(file: Express.Multer.File | undefined): Promise<string[]>;
export declare function ocrScanPdf(file: Express.Multer.File | undefined): Promise<string[]>;
export declare function convertPagesToImages(file: Express.Multer.File): Promise<{
    pages: {
        new: number;
        original: number;
    };
    imagesfolderPath: string;
}>;
export declare function clearUpUploadsFolder(): Promise<void>;
export declare function digitCount(num: number): number;
//# sourceMappingURL=files.d.ts.map