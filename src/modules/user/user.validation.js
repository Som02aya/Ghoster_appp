import joi from 'joi'
import { Types } from 'mongoose'
import {generalValidationFields} from '../../common/validation.js'
import { fileFieldValidation } from '../../multer/validation.multer.js'

export const shareprofile = {
  params: joi.object().keys({
    userId:generalValidationFields.id.required()
  }).required()
}

export const updatePassword={
  body:joi.object().keys({
    oldPassword:generalValidationFields.password.required(),
    Password:generalValidationFields.password.not(joi.ref("oldPassword")).required(),
    confirmPassword:generalValidationFields.confirmPassword("password").required()
  }).required()
}

export const profileImage={
    file:generalValidationFields.file(fileFieldValidation.image).required()
}


export const profileCoverImage={
    files:joi.array().items(generalValidationFields.file(fileFieldValidation.image).required()).min(1).max(5).required()
}

export const profileAttachments={
    files:joi.object().keys({
        profileImage:
         joi.array().items(generalValidationFields.file(fileFieldValidation.image).required()).length(1).required(),

        profileCoverImage: 
        joi.array().items(generalValidationFields.file(fileFieldValidation.image).required()).min(1).max(5).required()
}).required()
}