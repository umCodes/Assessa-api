import { parseJsonResponse } from "../utils/json";
import { encodeImageToBase64 } from "../utils/images";
import { geminiApiKey } from "../constants/env";
// import type { InvoiceScanModel } from "../models/invoiceScan.models.ts";
import { processImg as backupProccessing } from "../services/openrouter.services";

const GEMINI_API_KEY = geminiApiKey
const MODEL = "gemini-2.5-flash"


// let limitReached = true;
let retryAfter = 0;
const PROMPT = `Extract all text in an organized manner.`
export async function processImg(imagePath: string): Promise<any> {
    try {
        if (retryAfter > Date.now()) throw new Error(`Gemini API limit reached. Please try again after ${new Date(retryAfter).toLocaleTimeString()}. Using backup processing for this request.`);
        // if (limitReached) throw new Error("Gemini API limit reached. Using backup processing.")
        console.log(`Processing image at path: ${imagePath} using Gemini API.`);
        const data =  await Gemini(PROMPT, await encodeImageToBase64(imagePath))
        // console.log(parseJsonResponse(data));
        return data
    } catch (error) {
        if ((error as any).code === 429 && (error as any).message.includes("Quota exceeded")) {
            // retry after midnight
            const now = new Date();
            const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
            retryAfter = midnight.getTime();
            console.warn(`Gemini API quota exceeded. Setting retry after to ${midnight.toLocaleTimeString()}.`);
        }
        console.error("Error processing image with Gemini API.");
        return await backupProccessing(imagePath)
        // throw error
    }
}

async function Gemini(prompt: string, image: string) {
    const method = "POST"
    const headers = {
        "x-goog-api-key": GEMINI_API_KEY as string,
        "Content-Type": "application/json"
    }
    const body = JSON.stringify({
        contents: [
            {
                parts:[
                    {
                        inline_data: {
                            mime_type:"image/jpeg",
                            data: image
                        }
                    },
                    {text: prompt},
                ]
            }
        ]
    })

    try {

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
            method,
            headers,
            body
        })
        const data = await response.json()
        if (!data.candidates) throw data.error
        return data.candidates[0].content.parts[0].text
    } catch (error) {
        throw error;
    }
}