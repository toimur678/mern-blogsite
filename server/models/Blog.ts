import mongoose, { Document } from 'mongoose'

export interface EditorBlock {
    id?: string
    type: string
    data: Record<string, unknown>
}

export interface EditorOutputData {
    time?: number
    blocks: EditorBlock[]
    version?: string
}

export interface IBlog extends Document {
    title: string
    subTitle?: string
    description: EditorOutputData
    category: string
    image: string
    isPublished: boolean
    likes: Types.ObjectId[]
    createdAt: Date
    updatedAt: Date
}

const blogSchema = new mongoose.Schema<IBlog>({
    title: {type: String, required: true},
    subTitle: {type: String},
    description: {type: mongoose.Schema.Types.Mixed, required: true},
    category: {type: String, required: true},
    image: {type: String, required: true},
    isPublished: {type: Boolean, required: true},
    likes: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
}, {timestamps: true})

const Blog = mongoose.model<IBlog>('blog', blogSchema)

export default Blog
