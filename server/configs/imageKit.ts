import ImageKit from 'imagekit'
import { HttpError } from '../utils/http.js'

let imagekit: ImageKit | undefined

const getImageKit = (): ImageKit => {
    if (!process.env.IMAGEKIT_PUBLIC_KEY || !process.env.IMAGEKIT_PRIVATE_KEY || !process.env.IMAGEKIT_URL_ENDPOINT) {
        throw new HttpError(503, 'Image uploads are not configured. Add ImageKit credentials or use an HTTPS image URL.')
    }
    imagekit ??= new ImageKit({
        publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
        privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
        urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
    })
    return imagekit
}

export default getImageKit
