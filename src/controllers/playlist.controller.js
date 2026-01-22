import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import { Playlist } from "../models/playlist.model.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { isValidObjectId } from "mongoose"
import mongoose from "mongoose"

export const createPlaylist = asyncHandler(async(req ,res)=>{
        const {name, description,videoId} = req.body
        console.log(req.body)
        if(!name.trim() || !description.trim()){
            throw new ApiError(400,"Name & description both are required")
        }

        const playlist= await Playlist.create({
            name,
            description,
            owner: req.user._id,
            videos: videoId || []
        })
        if(!playlist){
            throw new ApiError(500,"Error while creating playlist")
        }
        return res
            .status(200)
            .json(new ApiResponse(200,"Playlist created successfully",playlist))

})

export const getUserPlaylists = asyncHandler(async(req,res)=>{
    const {userId} = req.params
    if(!userId || !isValidObjectId(userId)){
        throw new ApiError(400,"Invalid user Id!")
    }

    const playlist= await Playlist.aggregate([
        {
            $match:{
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup:{
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "videos",
            }
        },
    ])
    if(!playlist){
        throw new ApiError(404,"playlist not found!")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200,playlist,"playlist fetched successfully")
        )
})

