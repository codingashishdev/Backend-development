import { mongoose, isValidObjectId } from "mongoose"
import { Comment } from "../models/comment.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"

const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { page = 1, limit = 10 } = req.query

    if (!videoId) {
        throw new ApiError(400, "videoId is required")
    }

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "valid objectId is not given")
    }

    if (page < 1 || limit < 1) {
        throw new ApiError(400, "valid page and limit are required")
    }

    const videoComments = await Comment.aggregate([
        {
            $match: { video: videoId }
        },
        {
            $project: {
                $limit: limit,
                $skip: (page - 1) * limit
            }
        }
    ])

    return res
        .status(200)
        .json(new ApiResponse(200, videoComments, "Video comments fetched successfully"))
})

const addComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { commentContent } = req.body

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid videoId");
    }

    if (!commentContent?.trim()) {
        throw new ApiError(400, "comment content is required")
    }

    if (!videoId) {
        throw new ApiError(400, "videoId is required")
    }

    const comment = await Comment.findOneAndUpdate(
        {
            video: videoId
        },
        {
            $set: {
                content: commentContent
            }
        },
        { new: true, upsert: true }
    )

    if (!comment) {
        throw new ApiError(401, "Something went while adding comment")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, comment, "comment added successfully"))
})

const updateComment = asyncHandler(async (req, res) => {
    const { updatedContentForComment } = req.body

    if (!updatedContentForComment) {
        throw new ApiError(400, "updated content is required")
    }

    const { videoId } = req.params

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