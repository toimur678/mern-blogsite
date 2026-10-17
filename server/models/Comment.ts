import mongoose, { Document, Types } from 'mongoose'

export interface IComment extends Document<Types.ObjectId> {
    blog: Types.ObjectId
    user?: Types.ObjectId
    name: string
    content: string
    isApproved: boolean
    createdAt: Date
    updatedAt: Date
}

const commentSchema = new mongoose.Schema<IComment>({
    blog: {type: mongoose.Schema.Types.ObjectId, ref: 'blog', required: true},
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    name: {type: String, required: true, maxlength: 80},
    content: {type: String, required: true, maxlength: 2000},
    isApproved: {type: Boolean, default: false},
}, {timestamps: true})

commentSchema.index({blog: 1, isApproved: 1, createdAt: -1})
commentSchema.index({user: 1, createdAt: -1})

const Comment = mongoose.model<IComment>('Comment', commentSchema)

export default Comment
