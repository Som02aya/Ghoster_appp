import { TokenTypeEnum } from '../enums/sequrity.enum.js'
import { decodeToken } from '../security/token.security.js';
export const authentication = (tokenType=TokenTypeEnum.access)=>{
    return async (req,res,next)=>{
      
        const tokenn = req.headers?.authorization.split(" ")[1];
        console.log(tokenn);
        if(!tokenn){
            throw new Error("missing authorization key")
        }
        const {user,decode}=await decodeToken({token:tokenn,tokenType})
        req.user=user
        req.decode=decode
        next();

        
    }
}


export const authorization= (accessRoles=[])=>{
    return async (req,res,next)=>{
      console.log(req.user.role);
      if(!accessRoles.includes(req.user.role)){
        throw new Error("not allowed account ")
      }
      
        next();

        
    }
}


