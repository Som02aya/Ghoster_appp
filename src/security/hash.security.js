import {compare} from 'bcrypt'
import bcrypt from "bcrypt";
import { SALT_ROUND } from '../../config/config.service.js'
import * as argon2 from 'argon2'
import {HashEnum} from '../enums/index.js'
export const generateHash=async (plaintext,salt=SALT_ROUND,algo=HashEnum.Bcrypt)=>{
    let hash =''
    switch (algo) {
        case HashEnum.Bcrypt:
           hash= await bcrypt.hash(plaintext,salt)
            break;
        case HashEnum.Argon:
           hash= await argon2.hash(plaintext,salt)
            break;
        default:
            hash= await bcrypt.hash(plaintext,salt)
            break;
    }
    
    return hash
}



export const compareHash=async (plaintext,cipher,algo=HashEnum.Bcrypt)=>{
    let match = false
    switch (algo) {
        case HashEnum.Bcrypt:
           match= await bcrypt.compare(plaintext,cipher)
            break;
        case HashEnum.Argon:
           match= await argon2.verify(cipher,plaintext)
            break;
        default:
            match= await bcrypt.compare(plaintext,cipher)
            break;
    }
    return match
}
