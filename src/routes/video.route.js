import express from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { deleteVideo, getVideoById, publishAVideo, togglePublishStatus, updateVideo } from "../controllers/video.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router= express.Router();

router.post("/upload-video",verifyJwt,upload.fields([
    {name:'videoFile',maxCount:1},
    {name:'thumbnail',maxCount:1}
]),publishAVideo
)
router.get("/:videoId",getVideoById)
router.put("/update-video-details/:videoId",verifyJwt,updateVideo)
router.delete("/:videoId",verifyJwt,deleteVideo)
router.put("/isPublished/:videoId",verifyJwt,togglePublishStatus)
export default router