import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import {
  deleteFromCloudinary,
  UploadOnCloudinary,
} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { isValidObjectId } from "mongoose";


export const publishAVideo = asyncHandler(async (req, res) => {
  // Ask title and description and check if not empty
  // upload the video and thumbnail on cloudinary and get the url to store
  // publish on db and return the video data
  const { title, description } = req.body;
  if (
    [title, description].some((item) => {
      item?.trim() === "";
    })
  )
    throw new ApiError(400, "Both fields are required!");

  const videoFile = req.files?.videoFile[0];
  const thumbnailFile = req.files?.thumbnail[0];

  if (!videoFile) throw new ApiError(400, "Video file is missing!");
  if (!thumbnailFile) throw new ApiError(400, "Thumbnail file is missing!");

  const videoFileResponse = await UploadOnCloudinary(videoFile);
  const thumbnailFileResponse = await UploadOnCloudinary(thumbnailFile);

  if (!videoFileResponse)
    throw new ApiError(500, "Error while uploading video on cloudinary!");

  const video = await Video.create({
    title,
    description,
    videoFile: {
      url: videoFileResponse.url,
      public_id: videoFileResponse.public_id,
    },
    thumbnail: {
      url: thumbnailFileResponse.url,
      public_id: thumbnailFileResponse.public_id,
    },
    duration: videoFileResponse.duration,
    owner: req.user?._id,
  });
  const uploadedVideo = await Video.findById(video?._id).select("-owner");

  if (!uploadedVideo)
    throw new ApiError(500, "Error while uploading the video");

  return res
    .status(200)
    .json(new ApiResponse(200, "Video uploaded successfully!", uploadedVideo));
});

export const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(400, "give a valid video id");
  }
  const video = await Video.findById({ _id: videoId }).select(
    "-isPublished -owner -createdAt -updatedAt -__v"
  );

  if (!video) {
    throw new ApiError(404, "video not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video found successfully"));
});

export const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;

  if (!(title || description)) {
    throw new ApiError(400, "description or title field is missing");
  }

  const updateField = {};
  if (title) updateField.title = title;
  if (description) updateField.description = description;

  const video = await Video.findByIdAndUpdate(
    {
      _id: videoId,
    },
    {
      $set: updateField,
    },
    { new: true }
  ).select("-owner -isPublished");
  console.log(video);

  res
    .status(200)
    .json(new ApiResponse(200, video, "video details updated sucessfully"));
});

export const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const video = await Video.findById({ _id: videoId });

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  const videoPublic_id = video.videoFile?.public_id;
  const thumbnailPublic_id = video.thumbnail?.public_id;

  if (videoPublic_id) {
    await deleteFromCloudinary(videoPublic_id);
  }
  if (thumbnailPublic_id) {
    await deleteFromCloudinary(thumbnailPublic_id);
  }

  if (videoId) {
    await Video.findByIdAndDelete({ _id: videoId });
  }
  res.status(200).json(new ApiResponse(200, {}, "video deleted from db"));
});

export const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if(!videoId && !isValidObjectId(videoId)){
          throw new ApiError(400, "videoId is not valid")
  }
  const video = await Video.findById({ _id: videoId });
  if (!video) {
    throw new ApiError(404, "Video not found");
  }
   const isPublished = !video.isPublished;

  const result = await Video.findByIdAndUpdate(
    videoId,
    { isPublished },
    { new: true, runValidators: true }
  );

  res
    .status(200)
    .json(new ApiResponse(200, result, "publish status changed successfully"));
});
