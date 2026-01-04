import {v2 as cloudinary} from 'cloudinary'
import fs from 'fs'


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const UploadOnCloudinary = async (localFilePath) =>{
    try{
        if(!localFilePath) return null
        // upload the file on cloudinary
       const response = await cloudinary.uploader.upload(localFilePath, {
           resource_type: "auto" 
        })
        // file has been uploaded successfullly
            console.log("file is uploaded on cloudinary",response.url)
            return response
    }catch(error){
            fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed
    }
}

export {UploadOnCloudinary};
