import { User } from "../Models/User.model.js"
import { Apierror } from "../utills/ApiError.js"
import asyncHandler from "../utills/asyncHandler.js"
import Jwt  from "jsonwebtoken"



export const verifyJwt = asyncHandler(async(req,res,next)=>{
    try {
        const token = req.cookies?.accessToken || req.header("Authorization").replace("Bearer ","")
        if(!token){
            return  res.status(401).json(new Apierror(401,"Unauthorized Request"))
        }
       const decoded = await Jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
      const user = await User.findById(decoded?._id).select("-password -refreshToken")
        if(!user){
            return res.status(401).json(new Apierror(401, "Invalid Access Token"))
        }
        req.user = user
        next()
    } catch (error) {
        
        return res.status(401).json(new Apierror(401,  " Invalid Access token"))
        
        
    }
})