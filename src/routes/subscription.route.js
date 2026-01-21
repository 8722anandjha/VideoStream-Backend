import express from 'express'
import { verifyJwt } from '../middlewares/auth.middleware.js';
import { getSubscribedChannels, getUserChannelSubscribers, toggleSubscription } from '../controllers/subscription.controller.js';

const router = express.Router();


router.post("/toggle-subscription/:channelId",verifyJwt,toggleSubscription)
router.get("/subscribers/:channelId",getUserChannelSubscribers)
router.get("/subscribed-channel/:subscriberId",verifyJwt,getSubscribedChannels)

export default router