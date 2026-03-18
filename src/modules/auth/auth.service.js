import { UserModel,create,findOne, findOneAndUpdate } from "../../DB/index.js";
import { providerEnum, RoleEnum } from "../../enums/user.enums.js";
import {hash,compare, genSalt} from 'bcrypt'
import { compareHash, generateHash } from "../../security/hash.security.js";
import { encrypt ,decrypt} from "../../security/encryption.sequrity.js";
import jwt from 'jsonwebtoken'
import { Access_Expire_In, Refresh_Expire_In, System_TOKEN_SECRET_KEY, User_TOKEN_SECRET_KEY } from "../../../config/config.service.js";
import { generateToken } from "../../security/token.security.js";
import { TokenTypeEnum } from '../../enums/sequrity.enum.js';
import { verifyToken } from "../../security/token.security.js";

import { getTokenSignauture,createLoginCreadintials } from '../../security/token.security.js'
import {  AudienceEnum } from  '../../enums/sequrity.enum.js'
import {OAuth2Client} from 'google-auth-library';
import { model } from "mongoose";
//import { Otp } from "../../DB/model/otp.model.js";
import nodemailer from 'nodemailer'
import { sendEmail } from "../../utils/email/send.email.js";
import { emailTemplate } from "../../utils/email/tempelet.email.js";
import { baseRevokeTokenKey,revokeTokenKey , deleteKey, get, increment, keys, loginBlockKey, loginMaxTraialKey, otpBlockKey, otpKey, otpKey2StepV, otpMaxRequestKey, set, ttl, update } from "../../common/services/redis.services.js";
import { createNumberOtp } from "../../utils/otp.js";
import { emailEmitter } from "../../utils/email/email.event.js";
import { EmailEnum } from "../../enums/email.enum.js";
import { decodeToken } from "../../security/token.security.js";

const veriftEmailOtp=async ({email,subject=EmailEnum.confirmEmail,title="verify_account"})=>{
   //ckeck block
    const blockKey= otpBlockKey({email,type:subject})
    const remainingBlockTime =await ttl(blockKey)
    if (remainingBlockTime>0) {
       throw new Error(`you have reached max request traial count piease try again later after ${remainingBlockTime} seconds`);
    }

    const oldCodeTTL =await ttl(otpKey({email,type:subject}))
    if(oldCodeTTL>0){
    throw new Error(`sorry you cannot send new otp until first one expired pls try after ${oldCodeTTL}`);
    }
    //check max traial 
    const maxTraialCountKey =(otpMaxRequestKey({email,type:subject}))
    const checkMaxOtpRequest= Number(await get(maxTraialCountKey )||0)
    if (checkMaxOtpRequest>=3) {
       await set({key: otpBlockKey({email,type:subject}),
       value:0,
       ttl:300})
    
       throw new Error("you have reached max request traial count piease try again later after 300 seconds");
    
    }

    
    const code = await createNumberOtp()
    await set(
    {key: otpKey({email,type:subject}),
    value:await generateHash(code.toString()),
    ttl:120
    })
    


    await sendEmail({
              to:email,
              subject,
              html:emailTemplate({code,title})
            })

    
      checkMaxOtpRequest >0 ?await increment(maxTraialCountKey) :await set({key:maxTraialCountKey,value:1,ttl:300})
    

    return ;
}

export const signup = async (inputs) => {
    const {username,email,password,phone}=inputs;
    const checkuserexist = await findOne({model:UserModel,filter:{email},select :'email',options: {
        //populate:[{path:"lol"}]
        leen:true
    }})
    if(checkuserexist){
           throw new Error("USER EXISTS");
    }
    
    const user = await create({model:UserModel,
        data:[{username,email,password:await generateHash(password),phone:await encrypt(phone),provider:providerEnum.system}]
    })
    //emailEmitter.emit(EmailEnum.ConfirmEmail,async()=>{
     await veriftEmailOtp({email})
    //})
  

    return user
}


export const confirmEmail = async (inputs) => {
    const {email,otp}=inputs;
    const account = await findOne({model:UserModel,filter:{email, confirmEmail:{$exists:false},provider:providerEnum.system} 
     
    })
    if(!account){
           throw new Error("fill to find matched account");
    }
    
    const hashOtp=await get(otpKey({email}))
    if (!hashOtp) {
      throw new Error("expired otp");
    }

    if (!await  compareHash(otp.toString(),hashOtp)) {
      throw new Error("invalid otp");
    }

    account.confirmEmail=new Date()
    account.isVerified = true
    account.expireAt = null
    await account.save()
    await deleteKey(await keys(otpKey({email})))
    return ;
}



export const resendConfirmEmail = async (inputs) => {
    const {email}=inputs;
    const account = await findOne({model:UserModel,filter:{email, confirmEmail:{$exists:false},provider:providerEnum.system} 
     
    })
    if(!account){
           throw new Error("fill to find matched account");
    }
    
    /*const remaningTime=await ttl(otpKey({email}))
    if (remaningTime>0) {
      throw new Error(`sorry can not provide otp until existsone is expiredyou can try again later after ${ttl}`);
    }*/
    
    await veriftEmailOtp({email})
   
  

    return ;
}



/*export const login = async (inputs,issuer) => {
    const {email,password}=inputs;
    console.log( email)
   const user = await findOne({
  model: UserModel,
  filter: { email, provider: providerEnum.system,isVerified:{$exists:true} }
})
console.log(user)
    if(!user){
          throw new Error("no user");
    }
   const match= await compareHash(password,user.password)
   if(!match){
    await logintraial(email)
    throw new Error("invalid password");
   }
   await deleteKey(loginMaxTraialKey(email))
 console.log(user.role);

const {access_signature,refresh_signature,audience}=await getTokenSignauture(user.role)
const access_token = await generateToken({
  payload: { sub: user._id },
  secret: access_signature,
  options: {
    issuer,
    audience: [TokenTypeEnum.access, audience],
    expiresIn: Access_Expire_In
  }
})

const refresh_token = await generateToken({
  payload: { sub: user._id },
  secret: refresh_signature,
  options: {
    issuer,
    audience: [TokenTypeEnum.refresh, audience],
    expiresIn: Refresh_Expire_In
  }
})

return await createLoginCreadintials(user,issuer)
}*/



export const signupWithGmail=async({idToken,issuer})=>{
   const client = new OAuth2Client();
   const ticket = await client.verifyIdToken({ idToken, audience: ["133989944357-7m8uh13ksmsuu3pn2jssuc4l73kidp2k.apps.googleusercontent.com"] });
   const payload = ticket.getPayload();
   console.log("somaya");
   
   console.log(payload); 
   if(!payload?.email_verified){
    throw new Error("fail to authentcate this account with google")
   }
   const checkuserexist = await findOne({model:UserModel,filter:{email:payload.email}})
   console.log(checkuserexist);
   if (checkuserexist) {
    if (checkuserexist.provider==providerEnum.system) {
      throw new Error("account already exist with different provider")
    }
    const result= await loginWithGmail({idToken},issuer)
    return {result,status}
   }

   const user =await create({model:UserModel,data:[{
    firstName:payload.given_name,
    lastName:payload.family_name,
    email:payload.email,
    provider:providerEnum.google,
    profilepic:payload.picture,
    confirmEmail:new Date()
   }]})
   return{result: await createLoginCreadintials(user[0],issuer)}
   
  
  }

 export const loginWithGmail=async({idToken,issuer})=>{
   const client = new OAuth2Client();
   const ticket = await client.verifyIdToken({ idToken, audience: ["133989944357-7m8uh13ksmsuu3pn2jssuc4l73kidp2k.apps.googleusercontent.com"] });
   const payload = ticket.getPayload();
   console.log(payload); 
   if(!payload?.email_verified){
    throw new Error("fail to authentcate this account with google")
   }
   const user = await findOne({model:UserModel,filter:{email:payload.email,provider:providerEnum.google}})
   console.log(user);
   if (!user) {
    
      throw new Error("invalid login creaditals or invalid login approch")
   
    
   }

   return await createLoginCreadintials(user,issuer)
   
  
  }


  const logintraial=async (email)=>{
   //ckeck block
    const blockKey= loginBlockKey(email)
    const remainingBlockTime =await ttl(blockKey)
    if (remainingBlockTime>0) {
       throw new Error(`you have reached max login traial count piease try again later after ${remainingBlockTime} seconds`);
    }
    //check max traial 
    const maxTraialCountKey =loginMaxTraialKey(email)
    const checkMaxTraialRequest= Number(await get(maxTraialCountKey )||0)
    if (checkMaxTraialRequest>=5) {
       await set({key: loginBlockKey(email),
       value:0,
       ttl:300})
    
       throw new Error("you have reached max login traial count piease try again later after 300 seconds");
    
    }

    checkMaxTraialRequest > 0
    ? await increment(maxTraialCountKey)
    : await set({
        key: maxTraialCountKey,
        value: 1,
        ttl: 300
      })

   

    

    return ;
}

export const enableTwoStepVerification=async(user)=>{
 const useraccount =  await findOne({model:UserModel,filter:user._id})
 if (!useraccount) {
  throw new Error("no user account");
 }
 const email =user.email
  const code = await createNumberOtp()
    await set(
    {key: otpKey2StepV(email),
    value:await generateHash(code.toString()),
    ttl:300
    })
 emailEmitter.emit("Confirm_Email",{to:email,subject:"enable 2 step verification",code,title:"enable 2 step verification"})
}


export const verifyTwoStepVerification = async (otp,user) => {
    const email= user.email
    const account = await findOne({model:UserModel,filter:{email,provider:providerEnum.system} 
     
    })
    if(!account){
           throw new Error("fill to find matched account");
    }
    
    const hashOtp=await get(otpKey2StepV(email))
    if (!hashOtp) {
      throw new Error("expired otp");
    }

    if (!await  compareHash(otp.toString(),hashOtp)) {
      throw new Error("invalid otp");
    }
    account.is2StepVerificationEnabled = true;
    await account.save()
    await deleteKey(otpKey2StepV(email));
    return ;
}



export const NEWlogin = async (inputs,issuer) => {
    const {email,password}=inputs;
    console.log( email)
   const user = await findOne({
  model: UserModel,
  filter: { email, provider: providerEnum.system,isVerified:{$exists:true} }
})
console.log(user)
    if(!user){
          throw new Error("no user");
    }
   const match= await compareHash(password,user.password)
   if(!match){
    await logintraial(email)
    throw new Error("invalid password");
   }
   await deleteKey(loginMaxTraialKey(email))
 console.log(user.role);
if(user.
is2StepVerificationEnabled==true){
  const code = await createNumberOtp()
    await set(
    {key: otpKey2StepV(email),
    value:await generateHash(code.toString()),
    ttl:300
    })
     emailEmitter.emit("Confirm_Email",{
   to:email,
   subject:"login verification",
   code,
   title:"login verification"
 })

 return "otp sent pls verify it"

}
else{
const {access_signature,refresh_signature,audience}=await getTokenSignauture(user.role)
const access_token = await generateToken({
  payload: { sub: user._id },
  secret: access_signature,
  options: {
    issuer,
    audience: [TokenTypeEnum.access, audience],
    expiresIn: Access_Expire_In
  }
})

const refresh_token = await generateToken({
  payload: { sub: user._id },
  secret: refresh_signature,
  options: {
    issuer,
    audience: [TokenTypeEnum.refresh, audience],
    expiresIn: Refresh_Expire_In
  }
})


return await createLoginCreadintials(user,issuer)
}
}

export const confirmLogin = async (inputs, issuer) => {

const {email,otp} = inputs

const user = await findOne({
 model:UserModel,
 filter:{
  email,
  provider:providerEnum.system,
  
  is2StepVerificationEnabled:true
 }
})

if(!user){
 throw new Error("no user")
}

const hashOtp = await get(otpKey2StepV(email))

if(!hashOtp){
 throw new Error("expired otp")
}

if(!await compareHash(otp.toString(),hashOtp)){
 throw new Error("invalid otp")
}

await deleteKey(otpKey2StepV(email))

const {access_signature,refresh_signature,audience}=await getTokenSignauture(user.role)
const access_token = await generateToken({
  payload: { sub: user._id },
  secret: access_signature,
  options: {
    issuer,
    audience: [TokenTypeEnum.access, audience],
    expiresIn: Access_Expire_In
  }
})

const refresh_token = await generateToken({
  payload: { sub: user._id },
  secret: refresh_signature,
  options: {
    issuer,
    audience: [TokenTypeEnum.refresh, audience],
    expiresIn: Refresh_Expire_In
  }
})


return await createLoginCreadintials(user,issuer)

}


export const requestForgotPasswordCode=async({email})=>{
 const account = await findOne({
 model:UserModel,
 filter:{
  email,
  isVerified:true,
  provider:providerEnum.system
 
 }
})
if (!account) {
  throw new Error("invalid account")
}

emailEmitter.emit("sendEmail",async()=>{
     await veriftEmailOtp({email,subject:EmailEnum.ForgetPassword})
    })

    return;

}



export const verifyForgotPasswordCode=async({email,otp})=>{
 const hashOtp =await get(otpKey({email,type:EmailEnum.ForgetPassword}))
 if (!hashOtp) {
  throw new Error("expierd otp")
 }
 if (!await compareHash(otp.toString(),hashOtp)) {
  throw new Error("invalid otp")
 }


    return;

}


export const resetForgotPasswordCode=async({email,otp,password})=>{
await verifyForgotPasswordCode({email,otp})
const account =await findOneAndUpdate({
  model:UserModel,
  filter:{
  email,
  isVerified:true,
  provider:providerEnum.system
  },
  update:{
    password:await generateHash(password),
    changeCredentialTime:new Date()
  }
})
if (!account) {
  throw new Error("invalid account")
}
const otpKeys=await keys(otpKey({email,type:EmailEnum.ForgetPassword}))
const tokenKeys=await keys(baseRevokeTokenKey(account._id))
await deleteKey([...otpKeys,...tokenKeys])
    return;

}

export const requestForgotPasswordLink = async ({ email }) => {

  const account = await findOne({
    model: UserModel,
    filter: {
      email,
      //isVerified: true,
      provider: providerEnum.system
    }
  })

  if (!account) {
    throw new Error("invalid account")
  }

  const token = await generateToken({
    payload: { sub: account._id },
    options: {
      expiresIn: "10m",
      audience: [TokenTypeEnum.ForgetPassword, AudienceEnum.User]
    }
  })

  const resetLink = `http://localhost:3000/reset-password/${token}`

  emailEmitter.emit("sendEmail", async () => {
    await sendEmail({
      to: email,
      subject: "Reset Password",
      html: `<a href="${resetLink}">Click here to reset password</a>`
    })
  })

  return;
}

export const resetPasswordWithLink = async ({ token, password }) => {

  const { user, decode } = await decodeToken({
    token,
    tokenType: TokenTypeEnum.ForgetPassword
  })

  await findOneAndUpdate({
    model: UserModel,
    filter: { _id: user._id },
    update: {
      password: await generateHash(password),
      changeCredentialTime: new Date()
    }
  })

  
  await set(
    revokeTokenKey({ userId: user._id, jti: decode.jti }),
    true
  )

  return;
}
