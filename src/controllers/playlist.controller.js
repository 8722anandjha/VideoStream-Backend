import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Playlist } from "../models/playlist.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { isValidObjectId } from "mongoose";
import mongoose from "mongoose";

export const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description, videoId } = req.body;

  if (!name.trim() || !description.trim()) {
    throw new ApiError(400, "Name & description both are required");
  }

  const playlist = await Playlist.create({
    name,
    description,
    owner: req.user._id,
    videos: videoId || [],
  });
  if (!playlist) {
    throw new ApiError(500, "Error while creating playlist");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, "Playlist created successfully", playlist));
});

export const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!userId || !isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user Id!");
  }

  const playlist = await Playlist.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "videos",
        foreignField: "_id",
        as: "videos",
      },
    },
  ]);
  if (!playlist) {
    throw new ApiError(404, "playlist not found!");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "playlist fetched successfully"));
});

export const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  const playlist = await Playlist.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(playlistId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $project: {
              userame: 1,
              fullName: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: "$owner",
    },
    {
      $lookup: {
        from: "videos",
        localField: "videos",
        foreignField: "_id",
        as: "videos",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                    username: 1,
                    avatar: { url: 1 },
                  },
                },
              ],
            },
          },
          {
            $unwind: "$owner",
          },
        ],
      },
    },
  ]);

  if (!playlist.length) {
    throw new ApiError(500, "Error while fetching playlist");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "playlist fetched successfully"));
});

export const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  const data = await Playlist.findByIdAndDelete(playlistId);
  if (!data) {
    throw new ApiError(500, "Error while deleting playlist!");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "playlist deleted successfully"));
});

export const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!videoId || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video Id");
  }

  const playlist = await Playlist.findOneAndUpdate(
    {
      _id: playlistId,
      owner:req.user._id,
      videos: { $ne: videoId },
    },
    {
      $addToSet: { videos: videoId },
    },
    { new: true }
  );

  if (!playlist) {
    throw new ApiError(400, "Video already exists or playlist not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "video added to the playlist"));
});
