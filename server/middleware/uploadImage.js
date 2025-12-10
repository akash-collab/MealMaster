// server/middleware/uploadImage.js
import multer from "multer";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) cb(null, true);
  else cb(new Error("Only images are allowed"), false);
};

export const uploadImage = multer({ storage, fileFilter });