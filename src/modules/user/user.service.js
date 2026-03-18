import { model, Types } from 'mongoose'
import { create, deleteMany, find, findById, findOne } from '../../DB/database.service.js'
import {tokenModel, UserModel} from '../../DB/model/index.js'
import jwt from 'jsonwebtoken'
import { createLoginCreadintials, decodeToken } from '../../security/token.security.js'
import { TokenTypeEnum,LogoutEnum } from '../../enums/sequrity.enum.js';
import { decrypt } from '../../security/encryption.sequrity.js'
import ProfileViewHistory from '../../DB/model/profileveiwer.model.js'; 
import { Access_Expire_In, Refresh_Expire_In } from '../../../config/config.service.js'
import {  set ,revokeTokenKey, deleteKey,baseRevokeTokenKey} from '../../common/services/redis.services.js'
import { compareHash, generateHash } from '../../security/hash.security.js'
//import { Types } from 'mongoose'
const creatRevokeToken =async({userId,jti,ttl})=>{
  await  set({
      key:revokeTokenKey({userId,jti}),
      value:jti,
      ttl
    })
    return;
}
export const logout= async ({flag} ,user,{jti,iat,sub}) => {
let status =200  
switch (flag) {
  case LogoutEnum.all:
    user.changeCredentialTime=new Date()
    await user.save()
    await deleteKey(await keys(baseRevokeTokenKey(sub)))
    break;

  default:
   /* await create({model:tokenModel
      ,data:{userId:user._id},
      jti,
      expiresIn:new Date((iat+Refresh_Expire_In)*1000)
    })*/
      await creatRevokeToken({
    userId:sub,
    jti,
    ttl:iat+ Refresh_Expire_In

  })
    status =201
    break;
}  


return status
};


export const profile   = async(user)=>{

  const viewsCount = await ProfileViewHistory.countDocuments({
    viewedUserId: user._id
  }); 
   
return {user,viewsCount}
}


export const shareprofile   = async(userId,req)=>{
//const checkID = Types.ObjectId.isValid(userId)
//console.log(checkID);

const profile =  await findOne({
  model:UserModel,
  filter:{
    _id:userId
  },
  select:"firstName lastName username email phone picture"
})
if(profile.phone){
  profile.phone=await decrypt(profile.phone)
}

await ProfileViewHistory.create({
    viewedUserId: userId,
    viewerUserId: req.user?._id || null, 
    viewerIp: req.ip                        
  });

   
return profile
}

export const rotateToken   = async(user,{sub,jti,iat},issuer)=>{
    if ((iat+Access_Expire_In)*1000>Date.now()+(30000)) {
      throw new Error("current acess token still valid")
    }
   await creatRevokeToken({
    userId:sub,
    jti,
    ttl:iat+ Refresh_Expire_In

  })

 return await createLoginCreadintials(user,issuer)
}


export const updateProfileImageService = async (file,user) => {
/*await user.constructor.updateOne(
   { _id: user._id },
   {
     $push: {
       coverProfilepictures: {
         $each: files.map(file => file.finalPath),
         $slice: -5
       }
     }
   }
 );*/  
user.profilepic=file.finalPath
await user.save()

return user
};


export const updateProfileCoverImageService = async (files,user) => {
/*await user.constructor.updateOne(
   { _id: user._id },
   {
     $push: {
       oldProfilepics: user.profilepic
     },
     $set: {
       profilepic: file.finalPath
     }
   }
 );*/ 
user.coverProfilepictures=files.map(file=>file.finalPath)
await user.save()

return user
};


export const updatePassword=async({oldPassword,password},user,issuer)=>{
if (!await compareHash(oldPassword,user.password)) {
   throw new Error("invalid old password")
}
for (const hash of user.oldPasswords||[]) {
  if (!await compareHash(password,hash)) {
   throw new Error("sorry this password is weak you have already used it before")
}
}
user.oldPasswords.push(user.password)
user.password=await generateHash(password)
user.changeCredentialTime=new Date()
await user.save()
await deleteKey(await keys(baseRevokeTokenKey(user._id)))
return await createLoginCreadintials(user,issuer)
}