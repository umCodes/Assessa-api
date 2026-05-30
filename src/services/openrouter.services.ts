import { OpenRouter } from "@openrouter/sdk";
import { type ChatResult, type ChatRequest } from "@openrouter/sdk/models";
import { encodeImageToBase64 } from "../utils/images";
import { openRouterApiKey } from "../constants/env";

const OPEN_ROUTER_API_KEY = openRouterApiKey;

const openrouter = new OpenRouter({
  apiKey: OPEN_ROUTER_API_KEY
});

const models = [
  "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
  "moonshotai/kimi-k2.6:free",
  "nvidia/nemotron-nano-12b-v2-vl:free",
];

async function promptModel(model: string, imagePath: string) {
  console.log(imagePath);
  const base64Image = await encodeImageToBase64(imagePath);
  const imageDataUrl = `data:image/png;base64,${base64Image}`;
  const chatRequest: ChatRequest = {
    model,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Extract all text in an organized manner.",
          },
          {
            type: "image_url",
            imageUrl: { url: imageDataUrl, },

          },
        ],
      },
    ],
  };

  const response = await openrouter.chat.send({ chatRequest }) as ChatResult;

  return response.choices?.[0]?.message?.content;
}

export async function processImg(imagePath: string) {
  for (const model of models) {
    try {
      const result = await promptModel(model, imagePath);

      if (result) {
        console.log(`Success with ${model}`);
        return result;
      }
    } catch (error) {
      console.error(`Failed with ${model}:`);
    }
  }

  throw new Error("All models failed");
}



export async function pImg(imagePath: string) { 
  try{ 
    const base64Image = await encodeImageToBase64(imagePath); 
    const imageDataUrl = `data:image/png;base64,${base64Image}`;
    const chatRequest: ChatRequest = { 
        model: "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free", 
        messages: [{ 
          role: "user", 
          content: [
            { 
              type: "text", 
              text: "Extract all text in an organized manner." 
            }, 
            { 
              type: "image_url", 
              imageUrl: { url: imageDataUrl, },
            } 
          ], 
        } ] 
      } 
      const response = await openrouter.chat.send({ chatRequest }) as ChatResult; 
      // console.log(response.choices)
      console.log(response.choices[0] !== undefined &&  response.choices[0].message.content)
      return response.choices[0] !== undefined && response.choices[0].message.content;
    }catch(error){ 
       console.error("Error processing image with OpenRouter API:", error);
    }}

// (async () => await pImg("./uploads/08b3e045a70b317948e54604f8002b77-1780146074201/image-1.png"))()
