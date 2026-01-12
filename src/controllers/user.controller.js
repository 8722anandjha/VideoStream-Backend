import {User}  from '../models/user.model.js'
import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from '../utils/ApiError.js'
import {deleteFromCloudinary, UploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"
import {v2 as cloudaniry } from "cloudinary"
import mongoose from 'mongoose'


const generateAccessAndRefreshTokens = async(userId)=>{
        try{    
          const user = await User.findById(userId)
        
          const accessToken= user.generateAccessToken()
          const refreshToken= user.generateRefreshToken()

          user.refreshToken = refreshToken
          await user.save({validateBeforeSave: false})

          return {accessToken, refreshToken}

        }catch(error){
            throw new ApiError(500,"Something went wrong while generating Access and Refresh token")
        }
}



export const registerUser = asyncHandler( async (req, res)=>{
    // get user details from client
    // validatation- not empty
    // chek if user already exist: username,email
    // check for images, check for avatar
    // upload them to cloudaniry, avatar
    // create a user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res
    const  {username , email, password, fullName} =req.body
        // console.log(req.body)
        
    if(
        [fullName,email,username,password].some((field)=>
        field?.trim() === "")
    ){
       throw new ApiError(400, "All fields are required"); 
    }

    const existeduser= await User.findOne({
        $or: [{ username },{ email }]
    });
    if(existeduser){
        throw new ApiError(409,"user already exist")
    } 

    const avatarLocalFile = req.files?.avatar[0];
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalFile;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalFile= req.files.coverImage[0];
    }

    if(!avatarLocalFile){
        throw new ApiError(400,"Avatar file is required")
    }
    const avatar = await UploadOnCloudinary(avatarLocalFile)
    const coverImage = await UploadOnCloudinary(coverImageLocalFile)
   
    if(!avatar){
        throw new ApiError(400,"Avatar file is not uploaded on cloudinary")
    }

   const user= await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        username:username.toLowerCase(),
        email,
        password,
        avatar: avatar.url
    })
   const createdUser= await User.findById(user._id).select(
    "-password -refreshToken"
   )
   if(!createdUser){
    throw new ApiError(500,"Somtheing went wrong while regestering user")
   }
   return res.status(201).json(
    new ApiResponse(201,createdUser,"User registered succesfully")
   )
})

export const loginUser= asyncHandler(async(req , res)=>{
    // Get user details: email or username and passworrd
    //find user by its email or username
    // validate user password 
    //generate access and refresh token
    // store the refresh token in the db
    // store refresh and access token in cookie
    // send response to the user

    const {username,email,password}= req.body;
  
    if(!(username || email)){
        throw new ApiError(400,"username or email is required")
    }
    const existingUser = await User.findOne({
        $or: [{email},{username}]
    })
    if(!existingUser ){
        throw new ApiError(404,"user noed not exist")
    }
    const isPasswordValid = await existingUser.isPasswordCorrect(password);
    
    if(!isPasswordValid){
        throw new ApiError(401,"Invalid user credentials")
    }

   const {accessToken, refreshToken}= await generateAccessAndRefreshTokens(existingUser._id)

    // Query is repeated because the first User.findOne() returns a user with an empty refresh token in existingUser variable
   const loggedInUser = await User.findById(existingUser._id).select("-password -refreshToken") 

   const options ={
    httpOnly: true,
    secure: true
   }
   return res
   .status(200)
   .cookie("accessToken",accessToken,options)
   .cookie("refreshToken",refreshToken,options)
   .json(
    new ApiResponse(
        200,
        {
        user: loggedInUser,
        accessToken,
        refreshToken
        },
    "User logged in successfully"
    )
   )

})

export const logoutUser = asyncHandler(async(req, res)=>{
    await User.findByIdAndUpdate(req.user._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true
        }
    );
    const options ={
    httpOnly: true,
    secure: true
   }
   return res
   .status(200)
   .clearCookie("accessToken",options)
   .clearCookie("refreshToken",options)
   .json(new ApiResponse(200,{},"User logged Out"))
})

export const refreshAccessToken= asyncHandler(async(req,res)=>{
    const incomingRefreshToken= req.cookies?.refreshToken || req.body?.refreshToken
   
    if(!incomingRefreshToken){
        throw new ApiError(401,"Unauthorized request")
    }
    try{
         const decodedToken= jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET);
     
     const user= await User.findById(decodedToken?._id)
     if(!user){
        throw new ApiError(401,"Invalid refresh token")
     }

     if(incomingRefreshToken !== user.refreshToken){
        throw new ApiError(401,"Refresh token is expired or used")
     }
     const {accessToken, refreshToken}= await generateAccessAndRefreshTokens(user._id)
     const options={
        httpOnly: true,
        secure:true
     }
     return res
     .status(200)
     .cookie("accessToken",accessToken,options)
     .cookie("refreshToken",refreshToken,options)
     .json(
        new ApiResponse(
            200,
            {
                accessToken,
                refreshToken
            },
            "Access Token refreshed successfully"
    )
     )
    }catch(error){
        throw new ApiError(500,"Error while refreshing accessToken")
    }
})

export const changeCurrentPassword= asyncHandler(async(req ,res)=>{
    const {oldPassword, newPassword, confirmPassword}= req.body

    const user= await User.findById(req.user?._id);

    const validatePassword= await user.isPasswordCorrect

    if(!validatePassword){
        throw new ApiError(400,"Invalid old password")
    }

    if(newPassword !== confirmPassword){
        throw new ApiError(400,"new password & confirm password must be same")
    }

    user.password = newPassword
     await user.save({validateBeforeSave: true})

     res.
     status(200)
     .json(
        new ApiResponse(200,{},"Password changed successfully")
     )
})

export const getCurrentUser = asyncHandler(async(req ,res)=>{
    console.log(req.user)
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,req.user,"current user fetched successsfully"
        )
    )
})

export const updateAccountDetails = asyncHandler(async(req, res)=>{
    try{
        const {fullName,email,} = req.body
    
    if(!fullName || !email){
        throw new ApiError(400,"All fields are required")
    }
    const user =await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                fullName,
                email
            }
        },
        {new: true}
    ).select("-password")

    return res
            .status(200)
            .json(
                new ApiResponse(200,user,"Account details updated successfully")
            )
    } catch(error){
        throw new ApiError(500,"Error while updating user account details")
    }
})

export const upadateUserAvatar= asyncHandler(async(req,res)=>{
       try{
         const avatarLocalPath =req.file
        if(!avatarLocalPath){
            throw new ApiError(400,"Avatar file is missing")
        }
        // find old avatar url from db and extract public_id from that url
            const oldAvatar= await req.user.avatar;
            const parts= oldAvatar.split("/");
            const uploadIndx =parts.indexOf("upload");
            const public_id = parts.slice(uploadIndx +2).join("/").replace(/\.[^/.]+$/,"");
           
        const avatar= await UploadOnCloudinary(avatarLocalPath)

        if(!avatar.url){
            throw new ApiError(400,"Error while uploading on cloudinary")
        }
        // delete old avatar from cloudinary
        if(avatar.url){
            await deleteFromCloudinary(public_id);
        }
            
        
        const user = await User.findByIdAndUpdate(
            req.user?._id,
            {
                $set:{
                    avatar:avatar.url
                }
            },
            {new : true}
        ).select("-password -refreshToken")

        return res
               .status(200)
               .json(
                    new ApiResponse(
                        200,
                        user,
                        "Avatar changed successfully"
                    )
                )
       }catch(error){
        throw new ApiError(500,"Error while profile image change")
       }
})

export const updateUserCoverImage= asyncHandler(async(req,res)=>{
       try{
         const coverImageLocalPath =req.file
        
        if(!coverImageLocalPath){
            throw new ApiError(400,"coverImage file is missing")
        }
        // find old coverImage url from db and extract public_id from that url
            const oldCoverImage_url= await req.user.coverImage;
            const parts= oldCoverImage_url.split("/");
            const uploadIndx =parts.indexOf("upload");
            const public_id = parts.slice(uploadIndx +2).join("/").replace(/\.[^/.]+$/,"");

        const coverImage= await UploadOnCloudinary(coverImageLocalPath)

        if(!coverImage.url){
            throw new ApiError(400,"Error while uploading on cloudinary")
        }
        // delete old cover image from cloudinary
        if(coverImage.url){
            await deleteFromCloudinary(public_id);
        }
            
        const user= await User.findByIdAndUpdate(
            req.user?._id,
            {
                $set:{
                    coverImage:coverImage.url
                }
            },
            {new : true}
        ).select("-password -refreshToken")

        return res
                .status(200)
                .json(
                    new ApiResponse(
                        200,
                        user,
                        "CoverImage changed successfully"
                    )
                )
       }catch(error){
        throw new ApiError(500,"Error while cover image change")
       }
})

export const getUserChannelProfile = asyncHandler(async(req,res)=>{
       const {username}= req.params;
       if(!username?.trim()){
                throw new ApiError(400,"Username is missing")
       }

      const channel =await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            $lookup:{
                from: "subscriptions",
                localField:"_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup:{
                from: "subscriptions",
                localField:"_id",
                foreignField: "subscriber",
                as: "subscribedTO"
            }
        },
        {
            $addFields:{
                subscribersCount:{
                    $size: "$subscribers"
                },
                channelsSubscribedToCount: {
                    $size: "$subscribedTO"
                },
                isSubscribed:{
                    $cond:{
                        if:{$in:[req.user?._id,"$subscribers.subscriber"]},
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project:{
                fullName: 1,
                username:1,
                subscribersCount:1,
                channelsSubscribedToCount:1,
                isSubscribed:1,
                avatar:1,
                coverImage:1,
                email:1,
            }
        }
      ])

      if(!channel?.length){
        throw new ApiError(400,"channel does not exists")
      }
      return res
      .status(200)
      .json(
        new ApiResponse(200,channel[0],"user Channel fetched successfully")
      )
})

export const getWatchHistory= asyncHandler(async(req,res)=>{
    const user= await User.aggregate([
        {
            $match:{
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup:{
                from: "videos",
                localField:"watchHistory",
                foreignField:"_id",
                as:"watchHistory",
                pipeline:[
                    {
                        $lookup:{
                            from: "users",
                            localField:"owner",
                            foreignField:"_id",
                            as:"owner",
                            pipeline:[
                                {
                                    $project:{
                                        fullName:1,
                                        username:1,
                                        avatar:1,
                                    }
                                }
                            ]
                        }
                    },
                    {
                      $addFields:{
                        owner:{
                            $first:"$owner"
                        }
                      }  
                    }
                ] 
            }
        }
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            user[0].watchHistory,
            "watch history fetched successfully")
    )
}) 