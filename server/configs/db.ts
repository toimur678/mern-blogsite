import mongoose from "mongoose"

const MONGODB_URI = process.env.MONGODB_URI as string
const queryIndex = MONGODB_URI.indexOf('?')
const MODIFIED_URI = MONGODB_URI.slice(0, queryIndex) + 'quickblog' + MONGODB_URI.slice(queryIndex)

const connectDB = async (): Promise<void> => {
    try {
        mongoose.connection.on('connected', () => console.log("Database Connected"))
        
        await mongoose.connect(MODIFIED_URI)
        
    } catch(error) {
        console.log((error as Error).message);
    }
}

export default connectDB
