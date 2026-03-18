import mongoose from "mongoose";

const tokenSchema= new mongoose.Schema({
 userId:{type:mongoose.Schema.Types.ObjectId,ref:"User",require:true},
 jti :{type:String,require:true},
 expirsIn:{type:Date,require:true}
},{
  timestamps:true
})

tokenSchema.index("expirsIn",{expireAfterSeconds:0})
export const tokenModel =mongoose.models.Token || mongoose.model("Token",tokenSchema)