
import mongoose from "mongoose";

const profileViewSchema = new mongoose.Schema({
  viewedUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  viewerUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, 
  viewerIp: { type: String, default: null }, 
  viewedAt: { type: Date, default: Date.now, expires: 60*60*24*90 } 
});

const ProfileViewHistory = mongoose.model("ProfileViewHistory", profileViewSchema);
export default ProfileViewHistory;