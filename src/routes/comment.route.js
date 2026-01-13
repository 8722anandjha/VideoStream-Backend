import express from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { addComment, deleteComment, getCommentsByVideoId, updatecomment } from "../controllers/comment.controller.js";


const router= express.Router();


router.post("/add-comment/:videoId",verifyJwt,addComment)
router.put("/update-comment/:CommentId",verifyJwt,updatecomment)
router.delete("/delete-comment/:CommentId",verifyJwt,deleteComment)
router.get("/getAllComments/:videoId",getCommentsByVideoId)
export default router
