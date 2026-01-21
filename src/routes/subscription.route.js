import express from 'express'
import { verifyJwt } from '../middlewares/auth.middleware.js';
import { getSubscribedChannels, getUserChannelSubscribers, toggleSubscription } from '../controllers/subscription.controller.js';

const router = express.Router();
router.use(verifyJwt)

router.post("/c/:channelId",toggleSubscription)
router.get("/c/:channelId",getUserChannelSubscribers)
router.get("/u/:subscriberId",getSubscribedChannels)

export default router