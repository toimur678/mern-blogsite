import mongoose, { Document } from 'mongoose'

export interface IBlog extends Document {
    title: string
    subTitle?: string
    description: string
    category: string
    image: string
    isPublished: boolean
    createdAt: Date
    updatedAt: Date
}

const blogSchema = new mongoose.Schema<IBlog>({
    title: {type: String, required: true},
    subTitle: {type: String},
    description: {type: String, required: true},
    category: {type: String, required: true},
    image: {type: String, required: true},
    isPublished: {type: Boolean, required: true},
}, {timestamps: true})

const Blog = mongoose.model<IBlog>('blog', blogSchema)

export default Blog
