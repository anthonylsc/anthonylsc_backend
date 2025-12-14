
import express from 'express';
import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { verifyToken } from './auth.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Ensure upload directory exists
const uploadDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Memory storage for Image Processing
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

router.post('/', verifyToken, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image uploaded' });
        }

        const filename = `${uuidv4()}.webp`;
        const filepath = path.join(uploadDir, filename);

        // Convert to WebP and save
        await sharp(req.file.buffer)
            .webp({ quality: 80 })
            .toFile(filepath);

        const fileUrl = `/uploads/${filename}`;

        res.json({ success: true, url: fileUrl });
    } catch (err) {
        console.error('Upload error:', err);
        res.status(500).json({ error: 'Image processing failed' });
    }
});

export default router;
