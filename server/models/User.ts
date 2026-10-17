import mongoose, { Document, Types } from 'mongoose'

export interface IUser extends Document<Types.ObjectId> {
    name: string
    email: string
    password?: string
    role: 'user' | 'admin' | 'editor'
    isActive: boolean
    createdAt: Date
    updatedAt: Date
}

const userSchema = new mongoose.Schema<IUser>({
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
    password: { type: String, select: false }, // Optional because admin might log in with .env credentials
    role: { type: String, enum: ['user', 'admin', 'editor'], default: 'user' },
    isActive: { type: Boolean, default: true },
}, { timestamps: true })

const User = mongoose.model<IUser>('User', userSchema)

export default User
