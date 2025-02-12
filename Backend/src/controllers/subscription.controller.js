import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    if (!channelId) {
        throw new ApiError(400, "channelId is required");
    }

    if (!mongoose.Types.isValidObjectId(channelId)) {
        throw new ApiError(400, "not a valid objectId");
    }

    if (
        Subscription.exists({
            subscriber: req.User?._id,
            channel: channelId,
        })
    ) {
        throw new ApiError(400, "Subscription already exists");
    }

    const sub = await Subscription.create({
        subscriber: req.User?._id,
        channel: channelId,
    });

    if (!sub) {
        throw new ApiError(400, "Error while subscribing");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, sub, "channel subscribed successfully"));
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!channelId) {
        throw new ApiError(400, "channelId is required");
    }

    if (!mongoose.Types.isValidObjectId(channelId)) {
        throw new ApiError(400, "not a valid objectId");
    }

    const channelSubscribers = await Subscription.find({ channel: channelId });

    if (!channelSubscribers) {
        throw new ApiError(400, "Error while fetching channel subscribers");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                channelSubscribers,
                "channel subscribers fetched successfully"
            )
        );
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;

    if (!subscriberId) {
        throw new ApiError(400, "subscriberId is required");
    }

    if (!mongoose.Types.isValidObjectId(subscriberId)) {
        throw new ApiError(400, "not a valid objectId");
    }

    const channelsSubscribedByUser = await Subscription.find({
        subscriber: subscriberId,
    });

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                channelsSubscribedByUser,
                "User subscribed channels fetched successfully"
            )
        );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
