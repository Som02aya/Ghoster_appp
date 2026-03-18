import jwt from 'jsonwebtoken';
import { User_TOKEN_SECRET_KEY,Access_Expire_In,Refresh_Expire_In } from '../../config/config.service.js';
import { RoleEnum } from '../enums/user.enums.js'
import { AudienceEnum ,TokenTypeEnum} from '../enums/sequrity.enum.js'
import { findOne } from '../DB/database.service.js';
import { model } from 'mongoose';
import { UserModel } from '../DB/model/user.model.js';
import { randomUUID } from 'node:crypto';
import { tokenModel } from '../DB/model/token.model.js';
import { get, revokeTokenKey } from '../common/services/redis.services.js';
 

export const generateToken =async({
    payload={},
    secret=User_TOKEN_SECRET_KEY,
    options={}
}={})=>{
    return jwt.sign(payload,secret,options)
}

export const verifyToken =async({
    token,
    secret=User_TOKEN_SECRET_KEY,
    
}={})=>{
    return jwt.verify(token,secret)
}

export const getTokenSignauture =async(role)=>{
    let access_signature =undefined
    let refresh_signature =undefined
    let audience =AudienceEnum.User
//let refresh_audience ='User'
switch (role) {
    case RoleEnum.Admin:
       access_signature= process.env.System_TOKEN_SECRET_KEY
       refresh_signature=process.env.System_Refresh_TOKEN_SECRET_KEY
       audience =AudienceEnum.System
       //refresh_audience ='Refresh_System'
        break;

    default:
        access_signature=process.env.User_TOKEN_SECRET_KEY
        refresh_signature=process.env.User_Refresh_TOKEN_SECRET_KEY
        audience =AudienceEnum.User
        //refresh_audience ='Refresh_User'
        break;
}
return {access_signature,refresh_signature,audience}

}

export const getSignautureLevel =async(audienceType)=>{
    let signatureLevel =RoleEnum.User
  
switch (audienceType) {
    case AudienceEnum.System:
     signatureLevel=RoleEnum.Admin
     
        break;

    default:
      signatureLevel=RoleEnum.User
        break;
}
return signatureLevel

}


export const  createLoginCreadintials =async(user,issuer)=>{
    
    const {access_signature,refresh_signature,audience}=await getTokenSignauture(user.role)
    const jwtid = randomUUID()
    const access_token = await generateToken({
      payload: { sub: user._id },
      secret: access_signature,
      options: {
        issuer,
        audience: [TokenTypeEnum.access, audience],
        expiresIn: Access_Expire_In,
        jwtid
      }
    })
    
    const refresh_token = await generateToken({
      payload: { sub: user._id },
      secret: refresh_signature,
      options: {
        issuer,
        audience: [TokenTypeEnum.refresh, audience],
        expiresIn: Refresh_Expire_In,
        jwtid
      }
    })
    return {access_token,refresh_token}
}

export const decodeToken =async({token,tokenType=TokenTypeEnum.access}={})=>{
  console.log("RAW TOKEN:", token)
  const decode =jwt.decode(token)
  console.log(decode);
  
  if (!decode?.aud?.length) {
    throw new Error("fail to decode this  token") 
  } 
 const [decodetokenType,audienceType]=decode.aud

 if (decodetokenType!==tokenType) {
  throw new Error("invaild token type")
 }

 if (decode.jti &&await get(revokeTokenKey({userId:decode.sub,jti:decode.jti})) ) {
  throw new Error("invalid login session")
 }

 const signatureLevel =await getSignautureLevel(audienceType)

 const {access_signature,refresh_signature}=await getTokenSignauture(signatureLevel)

 const verifyedData =await verifyToken({token,
  secret:tokenType==TokenTypeEnum.refresh?refresh_signature:access_signature
 })
const user  = await findOne({model:UserModel,filter:{_id:verifyedData.sub}})

if (!user) {
  throw new Error("not register account")
}
console.log({changeCredentialTime:user.changeCredentialTime?.getTime(),iat:decode.iat*1000});
 if (user.changeCredentialTime &&user.changeCredentialTime?.getTime()>= decode.iat*1000) {
  throw new Error("invalid login session")
 }

 return {user,decode}
 
  
}