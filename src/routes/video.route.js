import express from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { publishAVideo } from "../controllers/video.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router= express.Router();

router.post("/upload-video",verifyJwt,upload.fields([
    {name:'videoFile',maxCount:1},
    {name:'thumbnail',maxCount:1}
]),publishAVideo
)

export default router