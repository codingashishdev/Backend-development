import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });
        // file has been uploaded successfully
        // console.log("File is uploaded on cloudinary", response.url);

        //unlinking files after uploaded
        fs.unlinkSync(localFilePath);
        // console.log(response);
        return response;
    }
    catch (error) {
        //it remove the locally saved temporary file as the upload operation got failed
        fs.unlinkSync(localFilePath);
        return null;
    }
}

const deleteFromCloudinary = async (oldFilePath) => {
    try {
        if (!oldFilePath) {
            throw new Error('No file path provided')
        }

        const response = await cloudinary.uploader.destroy(oldFilePath, {
            resource_type: "auto"
        });

        return response;    
    } catch (error) {
        console.log("Error deleting from cloudinary", error.message)
        throw error;
    }
}

export { uploadOnCloudinary, deleteFromCloudinary };