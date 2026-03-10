import { config } from "dotenv"
config();

export const signature = {
    accessToken: String(process.env.ACCESS_TOKEN_SIGNATURE),
    refreshToken: String(process.env.REFRESH_TOKEN_SIGNATURE) 
} 

export const ORIGIN = process.env.ORIGIN;
export const llmModels = {
    deepseek_r1: 'deepseek/deepseek-r1:free',

}
export const tokenAge = {
    accessToken: 60 * 25,
    refreshToken: 60 * 60 * 4,
}


export const PORT = Number(process.env.PORT); 
export const NODE_ENV = String(process.env.NODE_ENV); 

export const OPEN_ROUTER_MODEL = String(process.env.OPEN_ROUTER_MODEL); 
export const openRouterApiKey = String(process.env.OPEN_ROUTER_API_KEY); 
export const geminiApiKey = String(process.env.GEMINI_API_KEY); 
export const mongoURI = String(process.env.MONGO_URI)
export const mongoDBName = String(process.env.MONGO_DB_NAME)
