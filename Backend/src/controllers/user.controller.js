import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const generateAccessAndRefreshToken = async (userId) => {
    try {
        // Await as the database call takes some time to complete the operation
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(
            500,
            "something went wrong while generating access and refresh token"
        );
    }
};

const registerUser = asyncHandler(async (req, res) => {
    //steps to follow
    /*
      DONE - 1. get the user data
      DONE - 2. validation process - check whether if any field is empty
      DONE - 3. check if the user already exists: username, email
      DONE - 4. check for images, and avatar
      DONE - 5. upload them to cloudinary, avatar
      DONE - 6. create user object - create entry in DB
      DONE - 7. remove password and refreshToken from the response
      DONE - 8. check for user creation
      DONE - 9. return response
      */

    //getting the user data
    const { fullName, email, username, password } = req.body;
    // console.log(req.files);

    //validation process
    if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All the fields are necessary");
    }

    // cheking if user already exists
    // returns the first user found
    const existedUser = await User.findOne({
        $or: [{ email }, { username }],
    });

    if (existedUser) {
        throw new ApiError(409, "user with username and email already exists");
    }

    //files object contains information about the uploaded files
    // "?." -> optional chaining operator, used tp safely access deeply nested properties without causing an error if any part of the chain is null or undefined. it ensures that the code will not throw an error and will instead return undefined.
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverimageLocalPath = req.files?.coverImage[0]?.path;
    // console.log(req.files.coverImage);

    let coverimageLocalPath;
    if (
        req.files &&
        req.files.coverImage.length > 0 &&
        Array.isArray(req.files.coverImage)
    ) {
        coverimageLocalPath = req.files.coverImage[0].path;
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverimageLocalPath);

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required");
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase(),
    });

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    return res
        .status(201)
        .json(new ApiResponse(200, createdUser, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
    /*  1.get the user data
          2.username or email login
          3.find the user in DB
          4.password checking
          5.access token and refreshToken
          6.send token via cookies
          7.send success message
      */

    const { username, email, password } = req.body;

    if (!username && !email) {
        throw new ApiError(400, "username or password is required");
    }

    const user = await User.findOne({
        $or: [{ username }, { email }],
    });

    if (!user) {
        throw new ApiError(404, "user does not found!");
    }

    const passwordValid = await user.isPasswordCorrect(password);
    if (!passwordValid) {
        throw new ApiError(401, "Password is not valid!");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
        user._id
    );

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    // This ensures that changes to cookies can only be made from the server-side
    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                { user: loggedInUser, accessToken, refreshToken },
                "User logged in successfully"
            )
        );
});

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: { refreshToken: undefined },
        },
        {
            new: true,
        }
    )

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized access")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )

        const user = await User.findById(decodedToken?._id);
        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh Token is expired or used")
        }

        const options = {
            httpOnly: true,
            secure: true
        }

        const { accessToken, newRefreshToken } = await generateAccessAndRefreshToken(user._id)

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(200, { accessToken, refreshToken: newRefreshToken }, "Access Token Refreshed")
            )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }
})

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword, confirmedPassword } = req.body;

    if (!(confirmedPassword === newPassword)) {
        throw new ApiError(400, "new password and confirmed password is not matching")
    }
    const user = await User.findById(req.body?._id);
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password")
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false })

    return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "Password changed successfully")
        )
});

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(
            new ApiResponse(200, req.user, "Current user fetched successfully")
        )
});

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body;

    if (!(fullName || email)) {
        throw new ApiError(400, "All the fields are required")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName: fullName,
                email: email
            }
        },
        { new: true }
    ).select("-password")

    return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "Account Details Updated successfully")
        )
})

const updateAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing");
    }

    const oldUser = await User.findById(req.user?._id);
    const oldAvatarUrl = oldUser.avatar;
    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if (!avatar.url) {
        throw new ApiError(400, "Error while uploading an avatar");
    }

    const oldAvatar = await deleteFromCloudinary(oldAvatarUrl);

    if (!oldAvatar) {
        throw new ApiError(400, "Error while deleting an avatar");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            avatar: avatar.url
        },
        { new: true }
    ).select("-password")

    return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "Avatar updated successfully")
        )
})

const updateCoverImage = asyncHandler(async (req, res) => {
    const coverimageLocalPath = req.file?.path;

    if (!coverimageLocalPath) {
        throw new ApiError(400, "coverImage file is missing");
    }

    const coverImage = await uploadOnCloudinary(coverimageLocalPath);

    if (!coverImage.url) {
        throw new ApiError(400, "Error while uploading coverImage");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            coverImage: coverImage.url
        },
        { new: true }
    ).select("-password")

    return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "CoverImage updated successfully")
        )
});

const getUserProfile = asyncHandler(async (req, res) => {
    const { username } = req.params;

    if (!username?.trim()) {
        throw new ApiError(400, "username is missing");
    }

    // const user = await User.findOne({
    //     username: username
    // }).select("-password");

    // if (!user) {
    //     throw new ApiError(400, "user does not found");
    // }

    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers"
                },
                channelSubscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    //check if the current user is the one of the subscribers
                    if: { $in: [req.user?.id, "$subscribers.subscriber"] },
                    then: true,
                    else: false
                }
            }
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                subscribersCount: 1,
                channelSubscribedToCount: 1,
                isSubscribed: 1,
                coverImage: 1,
                avatar: 1,
                email: 1
            }
        }
    ])

    if (channel?.length == 0) {
        throw new ApiError(404, "Channel does not exists");
    }

    //channel[0] meaning the id is being returned
    return res
        .status(200).
        json(
            new ApiResponse(200, channel[0], "User channel details fetched successfully")
        )
})

const watchHistory = asyncHandler(async (req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user.id),
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addField: {
                            owner: {
                                $first: "owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                user[0].watchHistory,
                "watch history fetched successfully"
            )
        )
})

export { loginUser, registerUser, logoutUser, refreshAccessToken, changeCurrentPassword, getCurrentUser, updateAccountDetails, updateCoverImage, updateAvatar, getUserProfile, watchHistory }