import mongoose, { Document, Types } from 'mongoose'

export interface IUser extends Document {
    name: string
    email: string
    password?: string
    role: 'user' | 'admin' | 'editor'
    createdAt: Date
    updatedAt: Date
}

const userSchema = new mongoose.Schema<IUser>({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String }, // Optional because admin might log in with .env credentials
    role: { type: String, enum: ['user', 'admin', 'editor'], default: 'user' },
}, { timestamps: true })

const User = mongoose.model<IUser>('User', userSchema)

export default User
