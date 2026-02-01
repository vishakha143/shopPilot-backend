import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs'


const uploadOnCloudinary = async (filePath) => {
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY , 
        api_secret: process.env.CLOUDINARY_API_SECRET 
    });
    try {
        if(!filePath){
        return null
    }
    const uploadResult = await cloudinary.uploader.upload
    (filePath)
    fs.unlinkSync(filePath)


     // ✅ delete local file ONLY if it exists
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    } 

    return uploadResult.secure_url

    
        
    } catch (error) {
if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    console.error("Cloudinary upload error:", error.message);
    throw error; // IMPORTANT
    }
    
}
export default uploadOnCloudinary