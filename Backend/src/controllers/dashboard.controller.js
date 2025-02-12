import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc
    const { userId } = req.body?._id;

    if (!userId) {
        throw new ApiError(400, "userId is required");
    }

    if (!mongoose.Types.isValidObjectId(userId)) {
        throw new ApiError(400, "Not a valid objectId");
    }

    const videoViews = await Video.aggregate(
        { $match: { owner: userId } },
        {
            $project: {
                views: 1,
            },
        }
    );

    const totalSubscribers = await Subscription.countDocuments({ channel: userId });

    if (!totalSubscribers) {
        throw new ApiError("Error while getting channel subscribers")
    }

    const totalLikes = await Like.countDocuments({ video })

    if (!totalLikes) {
        throw new ApiError(400, "Error while fetching total likes");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, [videoViews, totalSubscribers, totalLikes], "Channel stats fetched successfully")
        )
});

const getChannelVideos = asyncHandler(async (req, res) => {
    const { userId } = req.body._id;

    if (!userId) {
        throw new ApiError(400, "userId is required")
    }

    if (!mongoose.Types.isValidObjectId(userId)) {
        throw new ApiError(400, "Not a valid objectId")
    }

    const channelVideos = await Video.find(
        { owner: userId }
    )

    if (!channelVideos) {
        throw new ApiError(400, "Something went wrong while fetching channel videos")
    }

    return res.status(200).json(new ApiResponse(200, channelVideos, "Channel videos fetched successfully"))
});

export { getChannelStats, getChannelVideos };
