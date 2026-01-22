import express from 'express'
import { createPlaylist, getUserPlaylists } from '../controllers/playlist.controller.js';
import { verifyJwt } from '../middlewares/auth.middleware.js';


const router = express.Router();
router.use(verifyJwt)

router.post("/",createPlaylist)
router.get("/:userId",getUserPlaylists)

export default router