import express from "express"
import { verifyJwt } from "../middlewares/auth.middleware.js"
import { createTweet, deleteTweet, getUserTweets, updateTweet } from "../controllers/tweet.controller.js"

const router= express.Router()

router.post("/create-tweet",verifyJwt,createTweet)
router.get("/get-tweet",verifyJwt,getUserTweets)
router.put("/update/:tweetId",verifyJwt,updateTweet)
router.delete("/delete/:tweetId",verifyJwt,deleteTweet)
export default router