import { Router } from "express";
import { profile, rotateToken, shareprofile, updateProfileImageService,updateProfileCoverImageService,logout,updatePassword } from "./user.service.js";
import { authentication, authorization } from "../../middleware/authentication.middleware.js";
import { TokenTypeEnum } from "../../enums/sequrity.enum.js";
import { RoleEnum } from "../../enums/user.enums.js";
import { endpoint } from "./user.authorization.js";
import { verifyToken } from "../../security/token.security.js";
import { User_TOKEN_SECRET_KEY } from "../../../config/config.service.js";
import { upload } from "../../middleware/multer.middleware.js";
import { UserModel } from "../../DB/model/user.model.js";
import { validation } from "../../middleware/validation.middlewear.js";
import * as validators from "./user.validation.js"
import { localFileUpload } from "../../multer/local.multer.js";
import { fileFieldValidation } from "../../multer/validation.multer.js";

const router=Router()

router.post("/logout",authentication(),async(req,res,next)=>{
  const status=await logout(req.body,req.user,req.decode)
  return res.status(200).json({message:"done logout" , status})
})


router.get("/" ,authentication(),authorization(endpoint.profile), async(req,res,next)=>{
    /*console.log(req.headers);
    const {authorization}=req.headers
    console.log(authorization);
    const {flag,credential}=authorization.split(" ")
    console.log(flag,credential);
    if(!flag||!credential){
        throw new Error("missing authorization parts")
    }
    switch (flag) {
        case 'Basic':
             const data= Buffer.from(credential,'base64').toString();
             const [username,password]=data.split(":")
             console.log(data);
             console.log(username,password);
              break;
       case 'Bearer':
         const result =verifyToken({token:credential,secret:User_TOKEN_SECRET_KEY})
         console.log(result);
         
              break;
        default:
            break;
    }*/

    const account  = await profile(req.user,req.params.userId)
    return res.status(200).json({
  message: "Profile",
  account: account.user,
  accountProfileViewsLast90Days: account.viewsCount
});

})

router.get("/:userId/share-profile",
  validation(validators.shareprofile),
  async(req,res,next)=>{
  const account =await shareprofile(req.params.userId,req)
  return res.status(200).json({message:"Profile" , account})
})



  
router.patch(
  "/profile-image",
  authentication(),
  localFileUpload({customPath:'users/profile',
    validation:fileFieldValidation.image
  }).single("attachment"),
  validation(validators.profileImage),
  async (req, res, next) => {
      const account = await updateProfileImageService(req.file,req.user)

      res.status(201).json({ message: "Profile image uploaded successfully",data:account });
  
  }
);


router.patch(
  "/profile-cover-image",
  authentication(),
  localFileUpload({customPath:'users/profile/cover',
    validation:fileFieldValidation.image
  }).array("attachment",5),
  validation(validators.profileCoverImage),
  async (req, res, next) => {
     const account = await updateProfileCoverImageService(req.files,req.user)

      res.status(201).json({ message: "Profile image uploaded successfully",data:{account} });
  
  }
);

router.patch("/password",authentication(),validation(validators.updatePassword),async(req,res,next)=>{
  const credentials =await updatePassword(req.body,req.user,`${req.protocol}://${req.host}`)
  res.status(201).json({ message: "Profile image uploaded successfully",data:{...credentials} });
})
   
    
    
    
    
    
    


router.post("/rotate" ,authentication(TokenTypeEnum.refresh), async(req,res,next)=>{
    
    const account  = await rotateToken(req.user,req.decode,`${req.protocol}://${req.host}`)
    return res.status(200).json({message:"Profile" , data:{...account}})
})
export default router