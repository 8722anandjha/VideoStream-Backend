import express from "express";
import { loginUser, logoutUser, refreshAccessToken, registerUser } from "../controllers/user.controller.js";
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
export default router