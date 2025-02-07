import mongoose, { isValidObjectId, mongo } from "mongoose"
import { Playlist } from "../models/playlist.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body

    if (!name || !description) {
        throw new ApiError(400, "name and description is required")
    }

    const createdPlaylist = await Playlist.create({
        name: name,
        description: description,
        videos: [],
        owner: req.userId
    })

    if (!createdPlaylist) {
        throw new ApiError(400, "error while creating playlist")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, createdPlaylist, "Playlist has been created"))
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params

    if (!userId) {
        throw new ApiError(400, "userID is required")
    }

    if (!mongoose.Types.isValidObjectId(userId)) {
        throw new ApiError(400, "A valid object ID has not been provided.")
    }

    //it is returning only 1 playlist
    // const userPlaylist = await Playlist.findOne({
    //     owner: userId
    // })

    //it should return multiple playlists(user find)
    const userPlaylist = await Playlist.find({
        owner: userId
    })

    if (!userPlaylist) {
        throw new ApiError(404, "Playlists not found")
    }

    return res.status(200).json(new ApiResponse(200, userPlaylist, "user playlists fetched successfully"))
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params

    if (!playlistId) {
        throw new ApiError(400, "playlistID is required")
    }

    if (!mongoose.Types.isValidObjectId(playlistId)) {
        throw new ApiError(400, "A valid object ID has not been provided.");
    }

    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    return res.status(200).json(new ApiResponse(200, playlist, "playlist fetched successfully"))
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params

    if (!playlistId || !videoId) {
        throw new ApiError(400, "playlistID and videoId both are required")
    }

    if (!mongoose.Types.isValidObjectId(playlistId) || !mongoose.Types.isValidObjectId(videoId)) {
        throw new ApiError(400, "A valid object ID has not been provided.")
    }

    const videoAdded = await Playlist.findByIdAndUpdate(
        playlistId,
        { $push: { videos: videoId } },
        { new: true }
    );

    if (!videoAdded) {
        throw new ApiError(400, "Error while adding video to playlist")
    }

    return res.status(200).json(new ApiResponse(200, "Video added to playlist successfully"))
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params

    if (!playlistId || !videoId) {
        throw new ApiError(400, "playlistId and videoId are required");
    }

    if (!mongoose.Types.isValidObjectId(playlistId) || !mongoose.Types.isValidObjectId(videoId)) {
        throw new ApiError(400, "A valid object ID has not been provided.")
    }

    const removedVideo = await Playlist.findByIdAndUpdate(
        playlistId,
        { $pull: { videos: videoId } },
        { new: true }
    )

    if (!removedVideo) {
        throw new ApiError(400, "Error while removing video from a desired playlist")
    }

    return res.status(200).json(new ApiResponse(200, {}, "video removed from playlist successfully"))
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params

    if (!playlistId) {
        throw new ApiError(400, "playlistId is required")
    }

    if (!mongoose.Types.isValidObjectId(playlistId)) {
        throw new ApiError(400, "A valid objectId has not been given.")
    }

    const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId);

    if (!deletedPlaylist) {
        throw new ApiError(400, "Error while deleting a playlist")
    }

    return res.status(200).json(new ApiResponse(200, {}, "Playlist deleted successfully"))
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    const { name, description } = req.body

    if (!playlistId) {
        throw new ApiError(400, "playlistId is required")
    }

    if (!name?.trim() || !description?.trim()) {
        throw new ApiError(400, "name and description are required")
    }

    if (!mongoose.Types.isValidObjectId(playlistId)) {
        throw new ApiError(400, "A valid objectId has not been given.")
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            name: name,
            description: description
        },
        { new: true }
    )

    if (!updatedPlaylist) {
        throw new ApiError(400, "Error while updating playlist")
    }

    return res.status(200).json(new ApiResponse(200, updatedPlaylist, "Playlist updated successfully"))

})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}