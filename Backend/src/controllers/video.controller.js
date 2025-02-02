import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, userId } = req.query;

    if (!(query || userId)) {
        throw new ApiError(400, "Invalid request");
    }
    let sortCriteria;
    if (sortBy === "upload-date") {
        sortCriteria = { createdAt: -1 };
    } else if (sortBy === "views") {
        sortCriteria = { views: -1 };
    } else {
        sortCriteria = { createdAt: -1 };
    }

    const videos = await Video.aggregate([
        {
            $match: {
                $and: [
                    { $or: [{ title: query }, { description: query }] },
                    { userId: userId },
                ],
            },
        },
        {
            $sort: sortCriteria,
        },
        {
            $limit: limit,
        },
    ]);
    return res
        .status(200)
        .json(new ApiResponse(200, videos, "Videos fetched successfully"));
});

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;

    if (!title || !description) {
        throw new ApiError(400, "title and description both are required")
    }

    const videoLocalPath = req.files?.videoFile[0].path;

    if (!videoLocalPath) {
        throw new ApiError(400, "Video file is required")
    }

    const thumbnailLocalPath = req.files?.thumbnail[0].path;

    if (!thumbnailLocalPath) {
        throw new ApiError(400, "thumbnail is required")
    }

    const video = await uploadOnCloudinary(videoLocalPath);

    if (!video) {
        throw new ApiError(400, "video upload failed")
    }

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    if (!thumbnail) {
        throw new ApiError(400, "thumbnail upload failed")
    }

    const videoData = await Video.create({
        videoFile: video.url,
        thumbnail: thumbnail.url,
        title: title.trim(),
        description: description.trim(),
        duration: video.duration,
        views: 0,
        isPublished: true,
        owner: req.userId
    })

    return res.status(200).json(new ApiResponse(200, videoData, "your video is ready to be watched"))
});

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    //one way to validate the videoId if it is valid or not
    if (!mongoose.Types.ObjectId(videoId)) {
        throw new ApiError(400, "not a valid videoId")
    }

    //this is the second way to validate
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "not a valid videoId")
    }
    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(400, "Video does not exists");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, video, "Video found successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!videoId) {
        throw new ApiError(400, "Don't know which video to be updated");
    }

    const oldVideo = await Video.findById(videoId);
    const oldThumbnailPath = oldVideo.thumbnail;
    const newThumbnailPath = req.files?.thumbnail[0].path;
    if (!newThumbnailPath) {
        throw new ApiError(400, "thumbnail file is required")
    }

    const thumbnail = await uploadOnCloudinary(newThumbnailPath);
    if (!thumbnail.url) {
        throw new ApiError(400, "Error while uploading thumbnail");
    }

    const oldThumbnail = await deleteFromCloudinary(oldThumbnailPath);
    if (!(oldThumbnail.result == 'ok')) {
        throw new ApiError(400, "Error while removing old thumbnail")
    }

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            title: req.body?.title,
            description: req.body?.description,
            thumbnail: thumbnail.url
        },
        { new: true }
    )

    return res.status(200).json(new ApiResponse(200, {}, "video updatded successfully"))
});

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if (!videoId) {
        throw new ApiError(400, 'which video is to be deleted is not given')
    }

    const deletedVideo = await Video.findByIdAndDelete(videoId)

    if (!deletedVideo) {
        throw new ApiError(400, "Something went wrong while deleting video");
    }

    const deleteVideoFile = deletedVideo.videoFile

    if (!deleteVideoFile) {
        throw new ApiError(400, "video file is required to be deleted")
    }

    const deleteThumbnailFile = deletedVideo.thumbnail

    if (!deleteThumbnailFile) {
        throw new ApiError(400, "thumbnail file is required to be deleted")
    }

    const deletedVideoFromCloudinary = await deleteFromCloudinary(deleteVideoFile);
    if (!deletedVideoFromCloudinary) {
        throw new ApiError(400, "video deletion failed")
    }
    const deletedThumbnailFromCloudinary = await deleteFromCloudinary(deleteThumbnailFile)
    if (!deletedThumbnailFromCloudinary) {
        throw new ApiError(400, "thumbnail deletion failed");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "video deleted successfully"))
});

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
});

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
};
