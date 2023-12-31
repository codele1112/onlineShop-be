require("dotenv").config;
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  allowedFormats: ["jpg", "png", "jpeg", "webp"],
  params: {
    folder: "onlineShop_products",
  },
});
// const cloudinaryUpload = async (image) => {
//   if (!image) return "";

//   try {
//     const res = await cloudinary.uploader.upload(image.path);

//     return res.secure_url;
//   } catch (error) {
//     console.log("upload to cloudinary error", error);
//     throw error;
//   }
// };

const uploadCloud = multer({ storage });

module.exports = uploadCloud;
