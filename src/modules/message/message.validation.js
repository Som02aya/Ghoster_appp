import joi from "joi";
import { generalValidationFields } from "../../common/validation.js";
import { fileFieldValidation } from "../../multer/validation.multer.js";

export const sendMessage ={
    body:joi.object().keys({
        content:joi.string().min(2).max(100000)
    }),
    params:joi.object().keys({
        receiverId:generalValidationFields.id.required()
    }).required(),
    files:joi.array().items(generalValidationFields.file(fileFieldValidation.image)).max(2)
}

export const getMessage ={
 params:joi.object().keys({
       messageId:generalValidationFields.id.required()
    }).required(),
}

