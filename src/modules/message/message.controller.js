import { Router } from "express";
import { sendMessage ,getMessageById, deleteMessageById, getAllmessage} from "./message.service.js";
import { localFileUpload } from "../../multer/local.multer.js";
import { fileFieldValidation } from "../../multer/validation.multer.js";
import { validation } from "../../middleware/validation.middlewear.js";
import * as validators from './message.validation.js'
import { authentication } from "../../middleware/authentication.middleware.js";
import { TokenTypeEnum } from "../../enums/sequrity.enum.js";
import { decodeToken } from "../../security/token.security.js";
const router=Router();

/*router.post("/:receiverId",
    localFileUpload({customPath:"messages",validation:fileFieldValidation.image,maxSize:1}).
    array("attachments",2),
    validation(validators.sendMessage)
    ,async(req,res,next)=>{
if (!req.body?.content && ! req.files ) {
    throw new Error("validation erorr at least one key is required")
}        
const message =await sendMessage(req.files,req.body,req.params.receiverId)    
return res.status(201).json({ message: "message sented",data:{message} });
})*/

/*router.post("/:receiverId/by-user",
    authentication(),
    localFileUpload({customPath:"messages",validation:fileFieldValidation.image,maxSize:1}).
    array("attachments",2),
    validation(validators.sendMessage)
    ,async(req,res,next)=>{
if (!req.body?.content && ! req.files ) {
    throw new Error("validation erorr at least one key is required")
}        
const message =await sendMessage(req.files,req.body,req.params.receiverId,req.user)    
return res.status(201).json({ message: "message sented",data:{message} });
})*/

router.post("/:receiverId",
    async(req,res,next)=>{
    if (req.headers?.authorization) {
         const {user,decode}=await decodeToken({token:req.headers.authorization.split(" ")[1],tokenType:TokenTypeEnum.access})
         req.user=user
         req.decode=decode
    }
    next()
    
    },
    localFileUpload({customPath:"messages",validation:fileFieldValidation.image,maxSize:1}).
    array("attachments",2),
    validation(validators.sendMessage)
    ,async(req,res,next)=>{
if (!req.body?.content && ! req.files ) {
    throw new Error("validation erorr at least one key is required")
}        
const message =await sendMessage(req.files,req.body,req.params.receiverId,req.user)    
return res.status(201).json({ message: "message sented",data:{message} });
})
router.get("/list",
    authentication()
    ,async(req,res,next)=>{ 
const messages =await getAllmessage(req.user)    
return res.status(201).json({ message: "message is",data:{messages} });
})

router.get("/:messageId",
    authentication(),
    validation(validators.getMessage)
    ,async(req,res,next)=>{ 
const message =await getMessageById(req.params.messageId,req.user)    
return res.status(201).json({ message: "message is",data:{message} });
})



router.delete("/:messageId",
    authentication(),
    validation(validators.getMessage)
    ,async(req,res,next)=>{ 
const message =await deleteMessageById(req.params.messageId,req.user)    
return res.status(201).json({ message: "message is",data:{message} });
})

export default router