import { create, deleteOne, find, findOne, MessageModel, UserModel } from "../../DB/index.js"

export const sendMessage =async (files=[],{content},receiverId,user)=>{
const receiver =await findOne({
    model:UserModel,
    filter:{
        _id:receiverId,
        
    },
})   
if (!receiver) {
    throw new Error("no matching account")
} 

const message =await create({model:MessageModel,
    data:{
  content,
  attachments:files.map(file=>file.finalPath),
  receiverId,
  senderId:user?user._id :undefined
    }
})
return message
}

export const getMessageById =async (messageId,user)=>{
const message=await findOne({model:MessageModel,
    filter:{_id:messageId,
      $or:[{senderId:user._id},
        {receiverId:user._id},
      ]  ,
      select:"-senderId"

    }
})
if (!message) {
    throw new Error("invalid messageId or not authorized action ")
}
  
return message
}


export const deleteMessageById =async (messageId,user)=>{
const message=await deleteOne({model:MessageModel,
    filter:{_id:messageId,
      
        receiverId:user._id,
      
      select:"-senderId"

    },
    
})
if (!message.deletedCount) {
    throw new Error("invalid messageId or not authorized action ")
}
  
return message
}

export const getAllmessage =async (user)=>{
    console.log( user._id)
const messages=await find({model:MessageModel,
    filter:{
      $or:[{senderId:user._id},
        {receiverId:user._id},
      ]  ,
      
      

    },
    
})

  
return messages
}