import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import mongoose from "mongoose";

export const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!channelId || !mongoose.isValidObjectId(channelId)) {
    throw new ApiError(500, "Channel Id is missing ");
  }

  const subscriptionExist = await Subscription.findOne({
    subscriber: req.user._id,
    channel: channelId,
  });
  if (subscriptionExist) {
    await Subscription.deleteOne(subscriptionExist);
    return res
    .status(200)
    .json(new ApiResponse(200, "Subscription removed successfully", {}));
  }else{
    const subcrriberTo= await Subscription.create({
        subscriber:req.user._id,
        channel:channelId
    })
    subcrriberTo.save()
    return res
    .status(200)
    .json(new ApiResponse(200, "Subscription added successfully", subcrriberTo));
  }

});

export const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!channelId || !mongoose.isValidObjectId(channelId)) {
    throw new ApiError(400, "Channel Id is missing ");
  }

  const channel = await User.findOne({ _id: channelId });
  if (!channel) {
    throw new ApiError(404, "This channel does not exist");
  }

  const subscribers = await Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(channelId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "subscriber",
        foreignField: "_id",
        as: "subscriber",
        pipeline: [
          {
            $project: {
              fullName: 1,
              username: 1,
              avatar: { url: 1 },
            },
          },
        ],
      },
    },
  ]);

  if (!subscribers || !Array.isArray(subscribers)) {
    throw new ApiError(500, "Error while fetching subscribers list");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Subscribers fetched successfully", subscribers)
    );
});

export const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

  const subscribedChannels = await Subscription.aggregate([
    {
      $match: {
        subscriber: new mongoose.Types.ObjectId(subscriberId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "channel",
        pipeline: [
          {
            $project: {
              username: 1,
              fullname: 1,
              avatar: { url: 1 },
            },
          },
        ],
      },
    },
    {
      $unwind: "$channel",
    },
  ]);
  if (!subscribedChannels || !Array.isArray(subscribedChannels))
    throw new ApiError(500, "Error while fetching subscribed channels list!");

  if (subscribedChannels.length ===0){
    return res.status(200).json(new ApiResponse(500,"You have not subscribed any channel Yet!")) 
  }

  return res
    .status(200)
    .json(new ApiResponse(200, subscribedChannels,"Subscribed channels fetched successfully!"));
});