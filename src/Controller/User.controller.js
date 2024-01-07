

import mongoose from "mongoose";
import { User } from "../Models/User.model.js";
import { Apierror } from "../utills/ApiError.js";
import { Apiresponse } from "../utills/ApiResponse.js";
import asyncHandler from "../utills/asyncHandler.js";
import { Note } from "../Models/Notes.model.js";



const registerUser = asyncHandler(async (req, res) => {

    console.log(req.body)
    const { userName, email, fullName, password } = req.body;
  
    if (
      [fullName, email, userName, password].some((field) => field?.trim() === "")
    ) {
      return res.status(400).json(new Apierror(400, "All fields are required"));
    }
    const exitedUser = await User.findOne({
      $or: [{ userName }, { email }],
    });
    
  
    
  
    // User already exit
    if (exitedUser) {
     
     return res.status(402).json(new Apierror(402, "User with email or username is exit"));
    }
  
   
  
    const newUser = await User.create({
      fullName,
      email,
      password,
      userName: userName.toLowerCase(),
    });
  
    const createdUser = await User.findById(newUser._id).select(
      "-password -refreshToken"
    );
    if (!createdUser) {
     return  res.status(500).json(new Apierror(500, "Something went wrong while registering the User"));
    }
    // console.log(createdUser);
  
    return res
      .status(201) // Set the HTTP status code to 201 (Created)
      .json(new Apiresponse(200, createdUser, "User Registered Successfully"));
  });



  const generateAccessandRefresstoken = async (userid)=>{
    try {
      const user = await User.findById(userid)
     const accessToken = await user.generateAccessToken() 
    //  console.log(`Access token --- ${accessToken}`)
     const refreshToken = await user.generateRefreshToken()
    //  console.log(`Refresh token --- ${refreshToken}`)
     user.refreshToken = refreshToken
    await user.save({validateBeforeSave:false})
  
    return {accessToken, refreshToken}
      
    } catch (error) {
      // console.log(error)
      return res.status(500).json(new Apierror(500,"Something went wrong while generating access token"))
    }
  
  }



  const loginUser = asyncHandler(async(req, res)=>{
   
  
   const {email,userName,password} = req.body
   if(!(email || userName)){
     return res.status(404).json(new Apierror(404,"username or password is required"))
   }
  
    const user = await User.findOne({
      $or:[{userName}, {email}]
    })
    if(!user){
      return res.status(404).json(new Apierror(404, " User Not Found "))
    }
  
    const isvalid = await user.isPasswordCorrect(password);
  
    if(!isvalid){
        const message=" Invalid User Credentials"
    res.status(404).json(new Apierror(404,message))
    return 
    }
  
    const {accessToken,refreshToken } = await generateAccessandRefresstoken(user._id);
   const loginedUser= await User.findById(user._id).select("-password -refreshToken")
  
   const options = {
    httpOnly:true,
    secure:true
   }
  
   return res.status(200).cookie("accessToken", accessToken,options)
   .cookie("refreshToken",refreshToken,options)
   .json(
    new Apiresponse(200,{
      user:loginedUser,accessToken,refreshToken
    },
    "User Login Successfully")
   )
  
  
  })
  
  const logoutUser = asyncHandler(async (req, res)=>{
    const userid = req.user._id
      await User.findByIdAndUpdate(userid,{
        $set:{
          refreshToken:undefined
        }
      },{
        new:true
      })
  
    const options = {
      httpOnly:true,
      secure:true
    }
  
    return res.status(200).clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(
      new Apiresponse(200,{},"User logout Successfully")
  )
  
  
  })



  const createNote = asyncHandler(async(req,res)=>{

    const {title,content} = req.body
    if(!title || !content){
      return res.status(401).json(new Apierror(401,"all fields are required"))

    }

    const userid = req.user?._id

    const note = await Note.create({
      title,
      content,
      user:userid
    })

    const newNote = await Note.findById(note._id)
    if(!newNote){
      return res.status(500).json(new Apierror(500,"Something Went Wrong while creating note "))
    }

    return res.status(200).json(new Apiresponse(200,newNote,"Note is created successfuly"))

  })


  const getNotes = asyncHandler(async(req,res)=>{
    const userid =req.user?._id

   const Notes= await Note.find({user:userid})
   

     return res.status(200).json(new Apiresponse(200,Notes,"Notes Fetched Successfully"))


  })

  const getNotesbyId = asyncHandler(async(req,res)=>{
    const {id} =req.params

    try {
      // Check if the provided ID is a valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json(new Apierror(400,"Invalid Id "))
      }
  
      
      const note = await Note.findById(id);
  
      return res.status(200).json(new Apiresponse(200,note,"Notes Fetched Successfully"))
    } catch (error) {
      console.error('Error in getNoteById:', error.message);
      throw error; // Throw the error for handling in the calling code
    }
    
  


  })


  
 const updateNote = asyncHandler(async(req,res)=>{
  const {id,title,content} = req.body
  try {
    // Check if the provided ID is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json(new Apierror(400,"Invalid Id "))
    }

    
    const note = await Note.findByIdAndUpdate(id,{
      $set:{
        title:title,
        content:content
      }
    },
    {
      new:true
    })
   

    return res.status(200).json(new Apiresponse(200,note,"Note updated successfully"))
  } catch (error) {
    console.error('Error in getNoteById:', error.message);
    throw error; // Throw the error for handling in the calling code
  }
  
 })



const deleteNote = asyncHandler(async(req,res)=>{
  const {id} = req.body
  try {
    // Check if the provided ID is a valid ObjectId
    console.log(mongoose.Types.ObjectId.isValid(id))
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json(new Apierror(400,"Invalid Id "))
    }

    
    const note = await Note.findByIdAndDelete(id)
   

    return res.status(200).json(new Apiresponse(200,note,"Note deleted  successfully"))
  } catch (error) {
    console.error('Error in getNoteById:', error.message);
    throw error; // Throw the error for handling in the calling code
  }

})

const shareNote = asyncHandler (async(req,res)=>{
  const {userName, email} = req.body
  const {id} = req.params

  if(!(email || userName)){
    return res.status(400).json(new Apierror(400," userName and email are missing "))
  }
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log('eeeeeeeeeee')
      return res.status(400).json(new Apierror(400,"Invalid Id "))
    }
    const freind = await User.findOne({
      $or:[
       {email}, {userName}
      ]
    })
    if(!freind){
      return res.status(400).json(new Apierror(400,"No user is exist of given UserName and email"))

    }


    const note = await Note.findById(id)

    note.sharedWith.push(freind._id)
   const saved= await note.save();

   

   return res.status(200).json({
    message:"shared successfully",
    success:true
   })
    

  } catch (error) {
    console.log(error)
  }
})




export  {
    registerUser, loginUser , logoutUser, createNote,getNotes,getNotesbyId,updateNote,deleteNote,shareNote
}