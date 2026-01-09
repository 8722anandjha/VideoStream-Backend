import express from "express";
import { 
    changeCurrentPassword,
    getCurrentUser, 
    getUserChannelProfile, 
    getWatchHistory, 
    loginUser, 
    logoutUser, 
    refreshAccessToken, 
    registerUser, 
    upadateUserAvatar, 
    updateAccountDetails, 
    updateUserCoverImage } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = express.Router();

// router.route("/register").post(
//     upload.fields([
//         {
//             name: "avatar",
//             maxCount: 1
//         },
//         {
//             name: "coverImage",
//             maxCount: 1
//         }
//     ]),
//     registerUser)
router.post("/register",upload.fields(
    [
        { name: "avatar", maxCount: 1 },
        { name: "coverImage"  , maxCount: 1}
    ]) ,registerUser)

router.post("/login",loginUser)

//secured routes
router.post("/logout",verifyJwt,logoutUser)
router.post("/refresh-token",refreshAccessToken)
router.post("/change-password",verifyJwt,changeCurrentPassword)
router.get("/user-details",verifyJwt,getCurrentUser)

router.patch("/update-account",verifyJwt,updateAccountDetails)
router.patch("/avatar",
            upload.single('avatar'),
            verifyJwt,
            upadateUserAvatar
            )
router.patch("/coverImage",
    upload.single("coverImage"),
    verifyJwt,
    updateUserCoverImage
)
router.get("/c/:username",verifyJwt,getUserChannelProfile)
router.get("/history",verifyJwt,getWatchHistory)
export default router