import joi from 'joi'
import { Types } from 'mongoose'
export const generalValidationFields={
    id: joi.string().custom((value, helper) => {
    
          console.log(value, helper)
    
          if (!Types.ObjectId.isValid(value)) {
            return helper.message('invalid objectId')
          }
    
          return value
    
        }),

    email:joi.string().email({minDomainSegments:2,maxDomainSegments:3,tlds:{allow:['com','net','edu']}}),
    password:joi.string().pattern(new RegExp(/^(?=.*[a-z]){1,}(?=.*[A-Z]){1,}(?=.*\d){1,}(?=.*\W){1,}[\w\W\d].{8,25}$/)),
    username: joi.string()
        .pattern(new RegExp(/^[A-Z]{1}[a-z]{1,24}\s[A-Z]{1}[a-z]{1,24}$/))
        ,

    otp: joi.string()
        .pattern(new RegExp(/^\d{6}$/))
        ,    
      confirmPassword: (matchpath)=>{
        return joi.string().valid(joi.ref(matchpath))
      }
        ,
      phone: joi.string()
        .pattern(/^(02|2|\+2)?01[0-25]\d{8}$/),

     file:function(validation=[]) {
        return joi.object().keys({
                   "fieldname": joi.string().required(),
                    "originalname": joi.string().required(),
                    "encoding": joi.string().required(),
                    "mimetype": joi.string().valid(...Object.values(validation)).required(),
                    "finalPath": joi.string().required(),
                    "destination": joi.string().required(),
                    "filename": joi.string().required(),
                    "path": joi.string().required(),
                    "size": joi.number().required()
            })
     }  
        

          
}

