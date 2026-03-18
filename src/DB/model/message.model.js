import mongoose from "mongoose";

const messageSchema =new mongoose.Schema({
receiverId:{type:mongoose.Schema.Types.ObjectId,ref:"User",require:true},
senderId:{type:mongoose.Schema.Types.ObjectId,ref:"User"},
content:{type:String,minLenght:2,maxLenght:100000,require:function(){
    return ! this.attachments?.lenght
}},
attachments:{type:[String]}

},{
    timestamps:true,
    collection:"SARAHA_MESSAGES",
    strictQuery:true,
    strict:true,
    toObject:{virtuals:true},
    toJSON:{virtuals:true}
})

export const MessageModel = mongoose.models.Message || mongoose.model("Message",messageSchema)