import { isValidObjectId, model } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;

  if (content.trim() === "") {
    throw new ApiError(404, "content is missing");
  }

  const tweet = await Tweet.create({
    content,
    owner: req.user._id,
  });
  if (!tweet) {
    throw new ApiError(500, "Error while creating tweet in db");
  }
  await tweet.save();
  res
    .status(200)
    .json(new ApiResponse(500, tweet, "tweet created successfully"));
});

export const getUserTweets = asyncHandler(async (req, res) => {

  const tweets= await Tweet.find({owner:req.user._id}).select("-updatedAt -__v")
  if(!tweets){
      throw new ApiError(400,"tweets not found")
  }
  res
  .status(200)
  .json(
      new ApiResponse(200,tweets,"tweets fetched successfully")
  )
});

export const updateTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const { content } = req.body;

  if (!tweetId && !isValidObjectId(tweetId)) {
    throw new ApiError(400, "Tweet ID is not valid");
  }

  if (content.trim() === "") {
    throw new ApiError(400, "content is missing");
  }

  const updatedTweet = await Tweet.findByIdAndUpdate(
    { _id: tweetId },
    {
      $set: {
        content,
      },
    },
    { new: true }
  ).select("-createdAt -__v");

  if (!updatedTweet) {
    throw newApiError(500, "Error while updating tweet!");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedTweet, "tweet updated successfully"));
});

export const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  if (!tweetId && !isValidObjectId(tweetId)) {
    throw new ApiError(400, "tweetId is not valid");
  }

  const deletedTweet = await Tweet.findByIdAndDelete({ _id: tweetId });

  if (!deletedTweet) {
    throw new ApiError(500, "Error while deleting tweet");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Tweet deleted successfully"));
});

