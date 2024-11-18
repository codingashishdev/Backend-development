import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js"

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
    8. check for user creation
    9. return response
    */

    //getting the user data
    const { fullName, email, username, password } = req.body;
    console.log("Email: ", email);


    //validation process
    if (
        [fullName, email, username, password].some((field) =>
            field?.trim() === "") || !email.includes("@")
    ) {
        throw new ApiError(400, "All the fields are necessary")
    }

    // cheking if user already exists
    // returns the first user found
    const existedUser = User.findOne({
        $or: [{ email }, { username }]
    })

    // if (existedUser) {
    //     throw new ApiError(409, "user with username and email already exists")
    // }

    //files object contains information about the uploaded files
    // "?." -> optional chaining operator, used tp safely access deeply nested properties without causing an error if any part of the chain is null or undefined. it ensures that the code will not throw an error and will instead return undefined.
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverimageLocalPath = req.files?.coverimage[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverimageLocalPath);

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser = User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )
})

export { registerUser };

