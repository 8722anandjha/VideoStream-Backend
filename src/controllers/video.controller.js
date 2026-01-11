import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { UploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";


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

  if (!videoFile) 
    throw new ApiError(400, "Video file is missing!");
  if (!thumbnailFile)
    throw new ApiError(400, "Thumbnail file is missing!");

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


