import multer from "multer";
const upload = multer({ dest: "uploads/" }).single("file"); 
export default upload;



