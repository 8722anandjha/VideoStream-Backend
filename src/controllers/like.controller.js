import mongoose, { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Like } from "../models/like.model.js";
import { Comment } from "../models/comment.model.js";
import { Video } from "../models/video.model.js";
import { Tweet } from "../models/tweet.model.js";

export const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  console.log(videoId);
  if (!videoId || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid videoId");
  }
  const video = await Video.findById(videoId);
  if (!video) throw new ApiError(404, "Video not found");

  const likeExists = await Like.findOne({
    video: videoId,
    likedBy: req.user?._id,
  });
  if (likeExists) {
    await Like.deleteOne(likeExists);

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "video unliked successfully"));
  }
  const likeAdded = await Like.create({
    video: videoId,
    likedBy: req.user?._id,
  });
  if (!likeAdded) {
    throw new ApiError(500, "Error while liking video!");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, likeAdded, "Video liked successfully"));
});

export const toggleCommentLike = asyncHandler(async (req, res) => {
  const { CommentId } = req.params;

  if (!CommentId || !isValidObjectId(CommentId)) {
    throw new ApiError(400, "Invalid videoId");
  }

  const comment = await Comment.findById(CommentId);
  if (!comment) throw new ApiError(404, "Comment not found");

  const likeExists = await Like.findOne({
    comment: CommentId,
    likedBy: req.user?._id,
  });
  if (likeExists) {
    await Like.deleteOne(likeExists);

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Comment unliked successfully"));
  }
  const likeAdded = await Like.create({
    comment: CommentId,
    likedBy: req.user?._id,
  });
  if (!likeAdded) {
    throw new ApiError(500, "Error while liking Comment!");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, likeAdded, "Comment liked successfully"));
});

export const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  if (!tweetId || !isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweetId");
  }

  const tweet = await Tweet.findById(tweetId);
  if (!tweet) throw new ApiError(404, "Tweet not found");

  const likeExists = await Like.findOne({
    tweet: tweetId,
    likedBy: req.user?._id,
  });
  if (likeExists) {
    await Like.deleteOne(likeExists);

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Tweet unliked successflly"));
  }
  const likeAdded = await Like.create({
    tweet: tweetId,
    likedBy: req.user?._id,
  });
  if (!likeAdded) {
    throw new ApiError(500, "Error while liking Tweet!");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, likeAdded, "Tweet liked successfully"));
});

export const getLikedVideos = asyncHandler(async (req, res) => {
  // const { skip=1, limit=1 } = req.params;

  const liekdVideos = await Like.aggregate([
    {
      $match: {
        likedBy: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "video",
      },
    },
    {
      $unwind: "$video",
    },
    {
      $match: {
        "video.isPublished": true,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "video.owner",
        foreignField: "_id",
        as: "owner",
      },
    },
    {
      $unwind: {
        path: "$owner",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $sort: {
        "video.views": -1,
      },
    },
    // { $skip: skip },
    // { $limit: limit },
    {
      $project: {
        _id: "$video._id",
        videoFileUrl: "$video.videoFile.url",
        thumbnailUrl: "$video.thumbnail.url",
        title: "$video.title",
        description: "$video.description",
        views: "$video.views",
        owner: {
          _id: "$owner._id",
          username: "$owner.username",
          avatar: "$owner.avatar",
        },
      },
    },
  ]);

  if (!liekdVideos) {
    throw new ApiError(400, "Not found any liked video");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, liekdVideos, "liked videos fetched successfully")
    );
});

export const getLikedComments = asyncHandler(async (req, res) => {
  // const { skip=1, limit=1 } = req.params;

  const likedComments = await Like.aggregate([
    {
      $match: {
        likedBy: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
    $match: {
      comment: { $ne: null },
    },
  },
    {
      $lookup: {
        from: "comments",
        localField: "comment",
        foreignField: "_id",
        as: "comment",
      },
    },
    {
      $unwind: "$comment",
    },
    {
      $lookup: {
        from: "videos",
        localField: "comment.video",
        foreignField: "_id",
        as: "video",
      },
    },
    {
      $unwind: {
        path: "$video",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "comment.owner",
        foreignField: "_id",
        as: "owner",
      },
    },
    {
      $unwind: {
        path: "$owner",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: "$comment._id",
        comment: {
          content: "$comment.content",
          createdAt: "$comment.createdAt",
        },
        video: {
          _id: "$video._id",
          title: "$video.title",
        },
        owner: {
          _id: "$owner._id",
          username: "$owner.username",
          avatar: "$owner.avatar",
        },
      },
    },
  ]);

  if (!likedComments) {
    throw new ApiError(400, "Not found any liked comment");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, likedComments, "liked comments fetched successfully")
    );
});


