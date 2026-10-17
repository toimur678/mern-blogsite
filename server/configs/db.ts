import mongoose from "mongoose"

const connectDB = async (): Promise<void> => {
    try {
        mongoose.connection.on('connected', () => console.log("Database Connected"))
        
        await mongoose.connect(process.env.MONGODB_URI as string)
        
    } catch(error) {
        console.log((error as Error).message);
    }
}

export default connectDB
