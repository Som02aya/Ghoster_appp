import { Router } from 'express'
import {  signup, loginWithGmail,signupWithGmail, confirmEmail, resendConfirmEmail, enableTwoStepVerification, verifyTwoStepVerification, NEWlogin, confirmLogin ,requestForgotPasswordCode, verifyForgotPasswordCode, resetForgotPasswordCode, requestForgotPasswordLink, resetPasswordWithLink} from './auth.service.js';
import { TokenTypeEnum } from '../../enums/sequrity.enum.js';
import { authentication } from '../../middleware/authentication.middleware.js';
import joi from'joi'
import nodemailer from "nodemailer";
//import { Otp } from '../../DB/model/otp.model.js';
//import { sendOtpService } from './auth.service.js';
//import { verifyOtpService } from './auth.service.js';
import * as validators from './auth.validation.js'
import { validation } from '../../middleware/validation.middlewear.js';
const router = Router(); 
router.post("/signup",validation(validators.signup), async (req, res, next) => {
    
    const result = await signup(req.body)
    return res.status(201).json({ message: "Done signup", result })
})

router.patch("/confirm-email",validation(validators.confirmEmail), async (req, res, next) => {
    
    const result = await confirmEmail(req.body)
    return res.status(201).json({ message: "otp veryfied", result })
})

router.patch("/resend-confirm-email",validation(validators.resendConfirmEmail), async (req, res, next) => {
    
    const result = await resendConfirmEmail(req.body)
    return res.status(201).json({ message: "otp veryfied", result })
})

/*router.post("/login",validation(validators.login), async (req, res, next) => {
    console.log(`${req.protocol}://${req.host}`);
    
    //console.log(req.protocol);
    //console.log(req.host);
    const result = await login(req.body,`${req.protocol}://${req.host}`)
    return res.status(201).json({ message: "Done login", result })
})*/


router.post("/newlogin",validation(validators.login), async (req, res, next) => {
    console.log(`${req.protocol}://${req.host}`);
    
    //console.log(req.protocol);
    //console.log(req.host);
    const result = await NEWlogin(req.body,`${req.protocol}://${req.host}`)
    return res.status(201).json({ message: "Done login", result })
})


router.post("/signup/gmail", async (req, res, next) => {
    console.log(req.body);
    const {account,status} =await signupWithGmail(req.body,`${req.protocol}://${req.host}`)
    return res.status(201).json({ message: "Done signupwith gmail", account })
})


router.post("/login/gmail", async (req, res, next) => {
    console.log(req.body);
    const account =await loginWithGmail(req.body,`${req.protocol}://${req.host}`)
    return res.status(201).json({ message: "Done signupwith gmail", account })
})

router.patch("/enable2-s-v",authentication(TokenTypeEnum.access), async (req, res, next) => {
    
    const result = await enableTwoStepVerification(req.user)
    return res.status(201).json({ message: "OTP sent to your email", result })
})


router.patch("/verify-s-v",validation(validators.verify2_s_v),authentication(TokenTypeEnum.access), async (req, res, next) => {
    
    const result = await verifyTwoStepVerification(req.body.otp,req.user)
    return res.status(201).json({ message: "two step verification enabeld successfuly", result })
})

router.patch("/confirm-login",validation(validators.confirmLogin), async (req, res, next) => {
    
    const result = await confirmLogin(req.body,`${req.protocol}://${req.host}`)
    return res.status(201).json({ message: "login verifed", result })
})


router.post("/request-forgot-password-code",validation(validators.verifyEmail), async (req, res, next) => {
    
    const result = await requestForgotPasswordCode(req.body)
    return res.status(201).json({ message: "otp code sent", result })
})


router.patch("/verify-forgot-password-code",validation(validators.verifyForgetPasswordEmailCode), async (req, res, next) => {
    
    const result = await verifyForgotPasswordCode(req.body)
    return res.status(201).json({ message: "otp code sent", result })
})

router.patch("/reset-forgot-password-code",validation(validators.resetForgetPasswordEmailCode), async (req, res, next) => {
    
    const result = await resetForgotPasswordCode(req.body)
    return res.status(201).json({ message: "otp code sent", result })
})

router.post("/request-forgot-password-link", async (req, res) => {
  const result = await requestForgotPasswordLink(req.body)
  return res.json({ message: "reset link sent", result })
})

router.patch("/reset-password-with-link", async (req, res) => {
  const result = await resetPasswordWithLink(req.body)
  return res.json({ message: "password updated", result })
})



export default router