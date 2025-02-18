import { mongoose, isValidObjectId } from "mongoose"
import { Comment } from "../models/comment.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!videoId) {
        throw new ApiError(400, "videoId is required")
    }

    if (!mongoose.Types.isValidObjectId(videoId)) {
        throw new ApiError(400, "valid objectId is not given")
    }

    const { page = 1, limit = 10 } = req.query

    if (page < 1 || limit < 1) {
        throw new ApiError(400, "valid page and limit are required")
    }

    const videoComments = await Comment.aggregate([
        {
            $match: { video: videoId }
        },
        {
            $skip: (page - 1) * limit
        },
        {
            $limit: limit
        }
    ])

    return res
        .status(200)
        .json(new ApiResponse(200, videoComments, "Video comments fetched successfully"))
})

const addComment = asyncHandler(async (req, res) => {
    const { commentContent } = req.body

    if (!commentContent?.trim()) {
        throw new ApiError(400, "comment content is required")
    }

    const videoId = req.body._id

    if (!videoId) {
        throw new ApiError(400, "videoId is required")
    }

    const comment = await Comment.findByIdAndUpdate(
        {
            video: videoId
        },
        {
            $set: {
                content: commentContent
            }
        },
        { new: true }
    )

    if (!comment) {
        throw new ApiError(400, "Error while adding comment")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, "comment added successfully"))
})

const updateComment = asyncHandler(async (req, res) => {
    const { updatedContentForComment } = req.body

    if (!updatedContentForComment) {
        throw new ApiError(400, "updated content is required")
    }

    const { videoId } = req.body._id

    if (!videoId) {
        throw new ApiError(400, "videoId is required")
    }

    const updatedComment = await Comment.findById(
        { video: videoId },
        {
            $set: {
                $cond: {
                    if: { $eq: ["$content", updatedContentForComment] },
                    then: { content: updatedContentForComment }
                }
            }
        },
        { new: true }
    )

    // const updatedComment = await Comment.findByIdAndUpdate(
    //     { video: videoId },
    //     {
    //         $set: {
    //             content: updatedContentForComment
    //         }
    //     },
    //     { new: true }
    // )

    return res
        .status(200)
        .json(
            new ApiResponse(200, updatedComment, "comment updated successfully")
        )
})

const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params

    if (!commentId) {
        throw new ApiError(400, "commentId is required")
    }

    const deletedComment = await Comment.findByIdAndDelete(commentId)

    if (!deletedComment) {
        throw new ApiError(400, "Error while deleting comment")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, deletedComment, "comment deleted successfully")
        )
})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}