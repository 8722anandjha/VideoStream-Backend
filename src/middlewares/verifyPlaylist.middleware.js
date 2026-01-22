import { asyncHandler } from "../utils/asyncHandler.js";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import mongoose, { isValidObjectId } from "mongoose";

export const verifyPlaylist = asyncHandler(async (req, _, next) => {
  try {
    const { playlistId } = req.params;

    if (!(playlistId && isValidObjectId(playlistId))) {
      throw new ApiError(400, "Valid playlistId is required!");
    }
    const playlist = await Playlist.findById(playlistId);

    if (!playlist)
      throw new ApiError(404, "Playlist doesn't exists with the ID!");

    next();
  } catch (error) {
    throw new ApiError(400, error?.message || "Invalid playlistID");
  }
});
