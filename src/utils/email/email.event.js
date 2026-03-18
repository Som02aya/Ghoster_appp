import {EventEmitter} from 'node:events'
import { sendEmail } from './send.email.js'
import { emailTemplate } from './tempelet.email.js'
export const emailEmitter =new EventEmitter()

emailEmitter.on("sendEmail",async(emailfunction)=>{
        console.log("event triggered")
       try {
       await emailfunction()
       } catch (error) {
        console.log(`fail to send user email ${error}`);
        
       }
})