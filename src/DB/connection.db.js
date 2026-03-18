import mongoose from "mongoose";
import { UserModel } from "./model/user.model.js";
export const connectdb = async()=>{
    try {
        const  result = await mongoose.connect(process.env.DB_URI)
        await UserModel.syncIndexes()
        console.log("connected");
        
    } catch (error) {
        console.log("fail");
    }
}