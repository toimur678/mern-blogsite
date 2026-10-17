import mongoose, { type Document, type Types } from 'mongoose'

export interface ISubscriber extends Document<Types.ObjectId> {
    email: string
    isActive: boolean
    createdAt: Date
    updatedAt: Date
}

const subscriberSchema = new mongoose.Schema<ISubscriber>({
    email: {type: String, required: true, unique: true, trim: true, lowercase: true, maxlength: 254},
    isActive: {type: Boolean, default: true},
}, {timestamps: true})

export default mongoose.model<ISubscriber>('Subscriber', subscriberSchema)
