import multer from "multer";
import path from "path"
import fs from "fs"

const __dirname = path.resolve(); // project root

const uploadPath = path.join(__dirname, "public", "temp");

// ensure folder exists
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath)
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})
  
 export const upload = multer({
  storage:storage
})