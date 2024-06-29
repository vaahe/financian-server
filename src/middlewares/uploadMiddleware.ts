import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadDir = path.join(__dirname, '../uploads/');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const thumbnailDir = path.join(uploadDir, 'thumbnails');
const videoDir = path.join(uploadDir, 'videos');

[thumbnailDir, videoDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let uploadPath = uploadDir;
        if (file.fieldname === 'thumbnail') {
            uploadPath = thumbnailDir;
        } else if (file.fieldname === 'videos') {
            uploadPath = videoDir;
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});


const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (file.fieldname === 'thumbnail') {
            if (file.mimetype.startsWith('image/')) {
                cb(null, true);
            } else {
                cb(new Error('Only image files are allowed for thumbnail'));
            }
        } else if (file.fieldname === 'videos') {
            if (file.mimetype.startsWith('video/mp4')) {
                cb(null, true);
            } else {
                cb(new Error('Only .mp4 files are allowed for videos'));
            }
        } else if (file.fieldname === 'avatar') {
            if (file.mimetype.startsWith('image/')) {
                cb(null, true)
            } else {
                cb(new Error('Only image files are allowed for avatar'));
            }
        } else {
            cb(new Error('Unexpected file field uploaded'));
        }
    },
});

export const uploadFiles = upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 },
    { name: 'videos', maxCount: 10 },
]);