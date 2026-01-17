import express from "express"
import {verifyJwt} from "../middlewares/auth.middleware.js"
import { getLikedComments, getLikedTweets, getLikedVideos, toggleCommentLike, toggleTweetLike, toggleVideoLike } from "../controllers/like.controller.js"


const router = express.Router()

router.post("/toggle-like-video/:videoId",verifyJwt,toggleVideoLike)
router.post("/toggle-like-comment/:CommentId",verifyJwt,toggleCommentLike)
router.post("/toggle-like-tweet/:tweetId",verifyJwt,toggleTweetLike)

router.get("/liked-videos",verifyJwt,getLikedVideos)
router.get("/liked-comments",verifyJwt,getLikedComments)
router.get("/liked-tweets",verifyJwt,getLikedTweets)
export default router