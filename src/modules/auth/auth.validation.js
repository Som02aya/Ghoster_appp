import joi from 'joi'
import { Query } from 'mongoose'
import {generalValidationFields} from '../../common/validation.js'
export const login = {
  body:joi.object().keys({
  email:generalValidationFields.email.required(),
  password:generalValidationFields.password.required()
  
}).required()
}


export const signup = {
  body:login.body.append({
  username:generalValidationFields.username
    .required(),
  confirmPassword: generalValidationFields.confirmPassword('password')
    .required(),
  phone:generalValidationFields.phone
    .required()
}).required()
}

export const confirmEmail = {
  body:joi.object().keys({
  email:generalValidationFields.email
    .required(),
  otp:generalValidationFields.otp.required()
}).required()
}



export const resendConfirmEmail = {
  body:joi.object().keys({
  email:generalValidationFields.email
    .required()

}).required()
}

export const verify2_s_v = {
  body:joi.object().keys({
  otp:generalValidationFields.otp
    .required()

}).required()
}


export const confirmLogin = {
  body:joi.object().keys({
  email:generalValidationFields.email
    .required(),
  otp:generalValidationFields.otp.required()
}).required()
}


export const verifyEmail  = {
  body:joi.object().keys({
  email:generalValidationFields.email
    .required()
}).required()
}



export const verifyForgetPasswordEmailCode  = {
  body:verifyEmail.body.append({
  otp:generalValidationFields.otp
    .required()
}).required()
}


export const resetForgetPasswordEmailCode  = {
  body:verifyForgetPasswordEmailCode.body.append({
  password:generalValidationFields.password.required(),
  confirmPassword: generalValidationFields.confirmPassword('password')
    .required(),
}).required()
}