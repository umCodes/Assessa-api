import { encodeImageToBase64 } from "../utils/images";
import { openRouterApiKey } from "../constants/env";

const OPEN_ROUTER_API_KEY = openRouterApiKey;
const OPEN_ROUTER_BASE_URL = "https://openrouter.ai/api/v1";

const models = [
  "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
  "moonshotai/kimi-k2.6:free",
  "nvidia/nemotron-nano-12b-v2-vl:free",
];

async function openRouterChat(model: string, imageDataUrl: string) {
  const response = await fetch(`${OPEN_ROUTER_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPEN_ROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Extract all text in an organized manner." },
            { type: "image_url", image_url: { url: imageDataUrl } },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter API error ${response.status}: ${error}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content as string | undefined;
}

export async function processImg(imagePath: string): Promise<string> {
  const base64Image = await encodeImageToBase64(imagePath);
  const imageDataUrl = `data:image/png;base64,${base64Image}`;

  for (const model of models) {
    try {
      const result = await openRouterChat(model, imageDataUrl);
      if (result) {
        console.log(`Success with ${model}`);
        return result;
      }
    } catch (error) {
      console.error(`Failed with ${model}:`, error);
    }
  }

  throw new Error("All models failed");
}

export async function pImg(imagePath: string): Promise<string | undefined> {
  try {
    const base64Image = await encodeImageToBase64(imagePath);
    const imageDataUrl = `data:image/png;base64,${base64Image}`;
    const result = await openRouterChat(
      "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
      imageDataUrl
    );
    console.log(result);
    return result;
  } catch (error) {
    console.error("Error processing image with OpenRouter API:", error);
  }
}