import multer from 'multer'
import { HttpError } from '../utils/http.js'

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {fileSize: 5 * 1024 * 1024, files: 1, fields: 5, fieldSize: 1024 * 1024},
    fileFilter: (_req, file, callback) => {
        if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.mimetype)) {
            callback(new HttpError(400, 'Use a JPEG, PNG, WebP, or GIF cover image.'))
            return
        }
        callback(null, true)
    },
})

export default upload
