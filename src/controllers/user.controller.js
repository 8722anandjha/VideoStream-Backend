import {User}  from '../models/user.model.js'
import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from '../utils/ApiError.js'
import {UploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"

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

    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath= req.files.coverImage[0].path;
    }

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is required")
    }
    const avatar = await UploadOnCloudinary(avatarLocalPath)
    const coverImage = await UploadOnCloudinary(coverImageLocalPath)
   
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