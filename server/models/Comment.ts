import mongoose, { Document, Types } from 'mongoose'

export interface IComment extends Document {
    blog: Types.ObjectId
    name: string
    content: string
    isApproved: boolean
    createdAt: Date
    updatedAt: Date
}

const commentSchema = new mongoose.Schema<IComment>({
    blog: {type: mongoose.Schema.Types.ObjectId, ref: 'blog', required: true},
    name: {type: String, required: true},
    content: {type: String, required: true},
    isApproved: {type: Boolean, default: false},
}, {timestamps: true})

const Comment = mongoose.model<IComment>('Comment', commentSchema)

export default Comment
