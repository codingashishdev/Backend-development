import mongoose, { isValidObjectId } from "mongoose"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!videoId) {
        throw new ApiError(400, "videoId is required")
    }

    if (!mongoose.Types.isValidObjectId(videoId)) {
        throw new ApiError(400, "A valid objectId has not been given")
    }

    const likedVideo = await Like.findByIdAndUpdate({
        video: videoId
    })

    return res.status(200).json(new ApiResponse(200, "Video liked successfully"))
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    if (!commentId) {
        throw new ApiError(400, "commentId is required")
    }

    if (!mongoose.Types.isValidObjectId(commentId)) {
        throw new ApiError(400, "A valid objectId has not been given")
    }

    const likedComment = await Like.findByIdAndUpdate({
        comment: commentId
    })

    if (!likedComment) {
        throw new ApiError(400, "Error while like comment")
    }

    return res.status(200).json(new ApiResponse(200, "Comment liked successfully"))
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params

    if (!tweetId) {
        throw new ApiError(400, "tweetId is required")
    }

    if (!mongoose.Types.isValidObjectId(tweetId)) {
        throw new ApiError(400, "Not a valid object id")
    }

    const likedTweet = await Like.findByIdAndUpdate({
        tweet: tweetId
    })

    return res.status(200).json(new ApiResponse(200, "Tweet liked successfully"))
})

const getLikedVideos = asyncHandler(async (req, res) => {
    const allLiked = await Like.find().populate('video')
    const likedVideos = allLiked.map((like) => like.video)

    return res
        .status(200)
        .json(
            new ApiResponse(200, likedVideos, "Liked videos fetched successfully")
        )
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}