import multer from 'multer';
import { storage } from '../utils/cloudinary.js'; // Note the .js extension!

const upload = multer({ storage });

export default upload;