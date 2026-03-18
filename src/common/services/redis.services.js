//import { json } from "body-parser";
import { EmailEnum } from "../../enums/email.enum.js";
import { redisClient } from "../../DB/index.js";

export const baseRevokeTokenKey =(userId)=>{
    return `RevokeToken::${userId}`
}

export const revokeTokenKey =({userId,jti})=>{
    return `${baseRevokeTokenKey(userId)}::${jti}`
}

export const otpKey =({email,type=EmailEnum.ConfirmEmail})=>{
    return `OTP::User::${email}::${type}`
}

export const otpMaxRequestKey =({email,type=EmailEnum.ConfirmEmail})=>{
    return `${otpKey(email,type)}::Request`
}

export const otpBlockKey=({email,type=EmailEnum.ConfirmEmail})=>{
    return `${otpKey(email,type)}::Block::Request`
}

export const loginBlockKey=(email)=>{
    return `login::User::${email}::Block::traial`
}

export const loginMaxTraialKey =(email)=>{
    return `login::User::${email}::traial`
}


export const otpKey2StepV =(email)=>{
    return `Otp::User 2 step verification ::${email}`
}

export const set =async ({
    key,
    value,
    ttl
}={})=>{
    try {
        let data =typeof value==='string'? value:JSON.stringify(value)
        return ttl? await redisClient.set(key,data ,{EX:ttl}) :await redisClient.set(key,data)
    } catch (error) {
        console.log(`fail in redis set operation ${error}`);
        
    }
}

export const update =async ({
    key,
    value,
    ttl
}={})=>{
    try {
        if (!await redisClient.exists(key)) {
            return 0
        }
        return await set({key,value,ttl})
    } catch (error) {
        console.log(`fail in redis update operation ${error}`);
        
    }
}

export const get =async (key)=>{
    try {
        try {
            return JSON.parse(await redisClient.get(key))
        } catch (error) {
            return await redisClient.get(key)
        }

    } catch (error) {
        console.log(`fail in redis get operation ${error}`);
        
    }
}


export const ttl =async (key)=>{
    try {
       return await redisClient.ttl(key)

    } catch (error) {
        console.log(`fail in redis ttl operation ${error}`);
        
    }
}


export const exists =async (key)=>{
    try {
       return await redisClient.exists(key)

    } catch (error) {
        console.log(`fail in redis exists operation ${error}`);
        
    }
}


export const expire =async ({key,ttl}={})=>{
    try {
       return await redisClient.expire(key,ttl)

    } catch (error) {
        console.log(`fail in redis expire operation ${error}`);
        
    }
}


export const mGet =async (keys=[])=>{
    try {
        if (!keys.length) return 0
       return await redisClient.mGet(keys)

    } catch (error) {
        console.log(`fail in redis mGet operation ${error}`);
        
    }
}

export const keys=async(prefix)=>{
    try {
       return await redisClient.keys(`${prefix}*`)

    } catch (error) {
        console.log(`fail in redis keys operation ${error}`);
        
    }
}

export const deleteKey =async (key)=>{
    try {
        if (!key.length) return 0
       return await redisClient.del(key)

    } catch (error) {
        console.log(`fail in redis mGet operation ${error}`);
        
    }
}

export const increment =async (key)=>{
    try {
        if (!await redisClient.exists(key)) {
            return 0
        }
        return redisClient.incr(key)
    } catch (error) {
        console.log(`fail in redis increment operation ${error}`);
        
    }
}


