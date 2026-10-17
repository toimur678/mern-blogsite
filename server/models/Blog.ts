import mongoose, { Document, Types } from 'mongoose'

export interface EditorBlock {
    id?: string
    type: string
    data: Record<string, unknown>
}

export interface EditorListEntry {
    content: string
    items: (string | EditorListEntry)[]
    meta: {checked?: boolean, start?: number, counterType?: string}
}

export interface EditorOutputData {
    time?: number
    blocks: EditorBlock[]
    version?: string
}

export interface IBlog extends Document<Types.ObjectId> {
    title: string
    subTitle?: string
    description: EditorOutputData
    category: string
    image: string
    isPublished: boolean
    likes: Types.ObjectId[]
    slug?: string
    authorName: string
    excerpt: string
    readTime: number
    tags: string[]
    featured: boolean
    publishedAt?: Date
    createdAt: Date
    updatedAt: Date
}

const blogSchema = new mongoose.Schema<IBlog>({
    title: {type: String, required: true, trim: true, maxlength: 180},
    subTitle: {type: String, maxlength: 320},
    description: {type: mongoose.Schema.Types.Mixed, required: true},
    category: {type: String, required: true, trim: true, maxlength: 50},
    image: {type: String, required: true},
    isPublished: {type: Boolean, required: true, default: false},
    likes: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    slug: {type: String, unique: true, sparse: true},
    authorName: {type: String, default: 'The Editorial Team', maxlength: 80},
    excerpt: {type: String, maxlength: 320, default: ''},
    readTime: {type: Number, min: 1, default: 1},
    tags: [{type: String, maxlength: 30}],
    featured: {type: Boolean, default: false},
    publishedAt: {type: Date},
}, {timestamps: true})

blogSchema.index({isPublished: 1, createdAt: -1})
blogSchema.index({category: 1, isPublished: 1})

const Blog = mongoose.model<IBlog>('blog', blogSchema)

export default Blog
