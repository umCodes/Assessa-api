import { OPEN_ROUTER_MODEL, openRouterApiKey } from "../constants/env";
import { HttpError } from "../errors/http-error";



export async function promptLlm(prompt: string) {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${openRouterApiKey}`,
        },
        body: JSON.stringify({
            model: OPEN_ROUTER_MODEL,
            messages: [
            {
                role: 'user',
                content: prompt
            },
            ],
        }),
    });
    const data = await response.json()
    if (data.hasOwnProperty("error")) throw new HttpError("A Problem Occured Generating your Quiz.", 500)
    
    
    return data.choices[0].message.content

}

console.log();