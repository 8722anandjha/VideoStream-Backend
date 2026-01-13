import express from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { 
    deleteVideo, 
    getAllVideos, 
    getVideoById, 
    publishAVideo, 
    togglePublishStatus, 
    updateVideoDetails,
    updateVideoThumbnail} from "../controllers/video.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router= express.Router();

router.post("/upload-video",verifyJwt,upload.fields([
    {name:'videoFile',maxCount:1},
    {name:'thumbnail',maxCount:1}
]),publishAVideo
)
router.get("/:videoId",getVideoById)
router.put("/update-video-details/:videoId",verifyJwt,updateVideoDetails)
router.delete("/:videoId",verifyJwt,deleteVideo)
router.put("/isPublished/:videoId",verifyJwt,togglePublishStatus)
router.get("/",getAllVideos)
router.put("/update-thumbnail/:videoId",upload.single("thumbnail"),verifyJwt,updateVideoThumbnail )

export default router