import mongoose from "mongoose";
import { GenderEnum, providerEnum, RoleEnum } from "../../enums/index.js";
const userSchema = new mongoose.Schema({
    firstName:{
        type:String,
        require:[true,'firstname is mandatory'],
        minLenght:2,
        maxLenght:25

    },
  lastName:{
        type:String,
        require:[true,'lastname is mandatory'],
        minlength:2,
        maxlength:25

    },

    email:{
        type:String,
        require:true,
        unique:true,
    },
    password:{
     type:String,
     require: function(){
        return this.provider==providerEnum.system
     },
    },
    DOB:Date,
    phone: String,
    oldPasswords:[String],
    gender:{type:Number , enum: Object.values(GenderEnum),default:GenderEnum.male},
    provider:{
     type:Number,
     enum:Object.values(providerEnum),
     default:providerEnum.system

    },
    role:{
     type:Number,
     enum:Object.values(RoleEnum),
     default:RoleEnum.User

    },
    confirmEmail:Date,
    is2StepVerificationEnabled :{ 
        type: Boolean, 
        default: false 
    },
    changeCredentialTime:Date,
    profilepic:String,
    oldProfilepics: [String],
    coverProfilepictures:[String],
    otpCode: { 
        type: String 
    },
    otpExpires: { 
        type: Date 
    },
    isVerified: { 
        type: Boolean, 
        default: false 
    },
    expireAt:{
    type:Date,
   default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
   index:{expires:0}
}

},
{
    collection:"Route_Users",
    timestamps:true,
    strict:true,
    strictQuery:true
})
userSchema.virtual('username').set(function(value){
    const [firstName,lastName]= value.split(' ')|| []
    this.set({firstName,lastName})
}).get(function(){
    return this.firstName +" " +this.lastName

})

export const UserModel =mongoose.models.User|| mongoose.model("User",userSchema)