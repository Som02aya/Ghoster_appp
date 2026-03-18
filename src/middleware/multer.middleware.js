import multer from "multer";
import fs from "fs";
import path from "path";
import { UserModel } from "../DB/model/user.model.js";


const uploadFolder = path.join("uploads");


if (!fs.existsSync(uploadFolder)) {
    fs.mkdirSync(uploadFolder, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadFolder); 
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new Error("Images only!"), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
});