import fs from "fs/promises"

export async function encodeImageToBase64(imagePath: string): Promise<string> {
  const base64Image = await fs.readFile(imagePath, {encoding: "base64"});
  return base64Image;
}