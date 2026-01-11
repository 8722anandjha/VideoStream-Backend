import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { ApiError } from "./ApiError.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const UploadOnCloudinary = async (file) => {
  try {
    const is_video = file.mimetype.startsWith("video");
    // upload the file on cloudinary
    const response = await cloudinary.uploader.upload(file.path, {
      resource_type: is_video ? "video" : "image",
      folder: is_video ? "Video" : "Image",
    });

    console.log("file is uploaded on cloudinary", response);

    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    return response;
  } catch (error) {
    console.error("CLOUDINARY ERROR:", error.message);

    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    throw error; // 🔥 VERY IMPORTANT
    // remove the locally saved temporary file as the upload operation got failed
  }
};

const deleteFromCloudinary = async (publid_id) => {
  try {
    const result = await cloudinary.uploader.destroy(publid_id);

    return result;
  } catch (error) {
    throw new ApiError(
      500,
      "something went while deleting the file from cloudinary"
    );
  }
};
export { UploadOnCloudinary, deleteFromCloudinary };
