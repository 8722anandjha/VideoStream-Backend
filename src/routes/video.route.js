import express from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { getVideoById, publishAVideo, updateVideo } from "../controllers/video.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router= express.Router();

router.post("/upload-video",verifyJwt,upload.fields([
    {name:'videoFile',maxCount:1},
    {name:'thumbnail',maxCount:1}
]),publishAVideo
)
router.get("/:videoId",getVideoById)
router.post("/update-video-details/:videoId",verifyJwt,updateVideo)
export default router