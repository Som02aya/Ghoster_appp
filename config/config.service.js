import { resolve } from 'node:path'
import { config } from 'dotenv'


export const NODE_ENV = process.env.NODE_ENV

const envPath = {
    development: `.env.development`,
    production: `.env.production`,
}
console.log({ en: envPath[NODE_ENV] });


config({ path: resolve(`./config/${envPath[NODE_ENV]}`) })


export const port = process.env.PORT ?? 7000
export const DB_URI = process.env.DB_URI 
export const ENC_BYTE=process.env.ENC_BYTE



export const SALT_ROUND = parseInt(process.env.SALT_ROUND ?? '10')
export const ENCRYPTION_SECRET_KEY = Buffer.from(ENC_BYTE);
export const System_TOKEN_SECRET_KEY=process.env.System_TOKEN_SECRET_KEY
export const User_TOKEN_SECRET_KEY=process.env.User_TOKEN_SECRET_KEY
export const System_Refresh_TOKEN_SECRET_KEY=process.env.System_Refresh_TOKEN_SECRET_KEY
export const User_Refresh_TOKEN_SECRET_KEY=process.env.User_Refresh_TOKEN_SECRET_KEY
export const Access_Expire_In=parseInt(process.env.Access_Expire_In)
export const Refresh_Expire_In =parseInt(process.env.Refresh_Expire_In)
export const EMAIL_USER=process.env.EMAIL_USER
export const EMAIL_PASS=process.env.EMAIL_PASS
export const REDIS_URI=process.env.REDIS_URI
export const APPLICATION_NAME=process.env.APPLICATION_NAME
export const facebookLink=process.env.facebookLink
export const instegram=process.env.instegram
export const twitterLink=process.env.twitterLink
console.log({SALT_ROUND});
