import { config } from "dotenv";

config()

export const signatures = {
    accessToken: String(process.env.ACCESS_TOKEN_SIGNATURE),
    refreshToken: String(process.env.REFRESH_TOKEN_SIGNATURE),
    tokensStorage: String(process.env.TOKENS_STORAGE_SIGNATURE)
} 
export const tokenAge = {
    access: 20 * 60 * 1000,
    refresh: 7 * 24 * 60 * 60 * 1000
}
export const mongoURI = String(process.env.MONGO_URI)
export const mongoDBName = String(process.env.MONGO_DB_NAME)
