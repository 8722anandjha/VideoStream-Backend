import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Comment } from "../models/comment.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose, { isValidObjectId, mongo } from "mongoose";

export const addComment = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const { videoId } = req.params;

  if (!videoId) throw new ApiError(400, "video Id is missing");
  if (content.trim() === "") {
    throw ApiError(400, "comment is empty");
  }

  const addedComment = await Comment.create({
    content,
    video: videoId,
    owner: req.user?._id,
  });

  if (!addedComment) {
    throw new ApiError(500, "Error while adding comment!");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, addedComment, "Added comment successfully"));
});

export const updatecomment = asyncHandler(async (req, res) => {
  const { CommentId } = req.params;
  const { content } = req.body;
  if (!CommentId || !isValidObjectId(CommentId)) {
    throw new ApiError(400, "comment Id is Invalid!");
  }
  if (content.trim() === "") {
    throw new ApiError(400, "comment content is missing!");
  }

  const oldComment = await Comment.findById({ _id: CommentId });
  if (!oldComment) {
    throw new ApiError(400, "Comment doesn't exist with this ID");
  }
  if (!oldComment.owner.equals(req.user._id)) {
    throw new ApiError(403, "You are not authorized to update this comment");
  }

  const newComment = await Comment.findByIdAndUpdate(
    CommentId ,
    {
      $set: { content },
    },
    { new: true }
  );

  if (!newComment) {
    throw new ApiError(500, "Error while updating the comment!");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, newComment, "Comment updated successfully"));
});

export const deleteComment = asyncHandler(async (req, res) => {
  const { CommentId } = req.params;

  if (!CommentId || !isValidObjectId(CommentId)) {
    throw new ApiError(400, "Invalid comment Id!");
  }
  const comment = await Comment.findById(CommentId);

  if (!comment) {
    throw new ApiError(400, "Comment with this ID doesn't exist!");
  }
  if (!comment.owner.equals(req.user._id)) {
    throw new ApiError(403, "You are no authorized to delete this comment!");
  }
  const response = await Comment.findByIdAndDelete({ _id: CommentId });
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "comment deleted successfully"));
});

export const getCommentsByVideoId = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video Id!");
  }

  const videoComments = await Comment.aggregate([
  //  Match comments for video
  {
    $match: {
      video: new mongoose.Types.ObjectId(videoId)
    }
  },

  //  Join video
  {
    $lookup: {
      from: "videos",
      localField: "video",
      foreignField: "_id",
      as: "videoDetails"
    }
  },
  { $unwind: "$videoDetails" },

  //  Filter published videos
  {
    $match: {
      "videoDetails.isPublished": true
    }
  },

  //  Join owner
  {
    $lookup: {
      from: "users",
      localField: "videoDetails.owner",
      foreignField: "_id",
      as: "ownerDetails"
    }
  },
  { $unwind: "$ownerDetails" },
  //  Final shape
  {
    $project: {
      _id: 1,
      comment: "$content",
      videoTitle: "$videoDetails.title",
      thumbnail: "$videoDetails.thumbnail.url",
      views: "$videoDetails.views",
      owner: {
        _id: "$ownerDetails._id",
        username: "$ownerDetails.username",
        avatar: "$ownerDetails.avatar.url"
      }
    }
  }
]);

    if (!videoComments) {
      throw new ApiError(500, "Error while fetching comments!");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, videoComments, "Comments fetched successfully"));
});
