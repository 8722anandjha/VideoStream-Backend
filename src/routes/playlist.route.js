import express from 'express'
import { 
    addVideoToPlaylist,
    createPlaylist,
    deletePlaylist,
    getPlaylistById,
    getUserPlaylists, 
    removeVideoFromPlaylist, 
    updatePlaylist
} from '../controllers/playlist.controller.js';
import { verifyJwt } from '../middlewares/auth.middleware.js';
import { verifyPlaylist } from '../middlewares/verifyPlaylist.middleware.js';


const router = express.Router();
router.use(verifyJwt)

router.post("/",createPlaylist)
router.get("/:userId",getUserPlaylists)
router.get("/find/:playlistId",verifyPlaylist,getPlaylistById)
router.patch("/add/:playlistId/:videoId",verifyPlaylist,addVideoToPlaylist)
router.patch("/remove/:playlistId/:videoId",verifyPlaylist,removeVideoFromPlaylist)
router.patch("/update/:playlistId",verifyPlaylist,updatePlaylist)
router.delete("/:playlistId",verifyPlaylist,deletePlaylist)

export default router