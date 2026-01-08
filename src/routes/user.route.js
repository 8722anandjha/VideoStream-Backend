import express from "express";
import { changeCurrentPassword, getCurrentUser, loginUser, logoutUser, refreshAccessToken, registerUser, upadateUserAvatar, updateAccountDetails, updateUserCoverImage } from "../controllers/user.controller.js";
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
router.post("/update-account-details",verifyJwt,updateAccountDetails)
router.post("/update-avatar",
            upload.single('avatar'),
            verifyJwt,
            upadateUserAvatar
            )
router.post("/update-coverImage",
    upload.single("coverImage"),
    verifyJwt,
    updateUserCoverImage
)
export default router