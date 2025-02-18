import mongoose, {isValidObjectId}  from "mongoose"
import { Tweet } from "../models/tweet.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body

    if (!content?.trim()) {
        throw new ApiError(404, "Content not found")
    }

    const tweet = await Tweet.create({
        content: content,
        owner: req.User?._id
    })

    if (!tweet) {
        throw new ApiError(400, "Error while creating tweet")
    }

    return res.status(200).json(new ApiResponse(200, tweet, "Tweet created successfully"))
})

const getUserTweets = asyncHandler(async (req, res) => {
    const userId = req._id

    const userTweets = await Tweet.find({
        owner: userId
    })

    if(!userTweets) {
        throw new ApiError(400, "Error while fetching user tweets")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, [userTweets], "user tweets fetched successfully")
    )
})

const updateTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const { updatedContent } = req.body

    if (!updatedContent || !tweetId) {
        throw new ApiError(400, "updatedContent and tweetId are required")
    }

    const updatedTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            content: updatedContent
        },
        {
            new: true
        }
    )

    if (!updateTweet) {
        throw new ApiError(400, "Error while updating tweet")
    }

    return res.status(200).json(new ApiResponse(200, updatedTweet, "tweet updated successfully"))
})

const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId} = req.body;

    if (!tweetId) {
        throw new ApiError(400, "tweetId is required")
    }

    const deletedTweet = await Tweet.findByIdAndDelete(tweetId);

    if (!deletedTweet) {
        throw new ApiError(400, "Something went wrong while deleting tweet")
    }

    return res.status(200).json(new ApiResponse(200, deletedTweet, "tweet deleted successfully"))
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
