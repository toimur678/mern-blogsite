import mongoose from "mongoose"
 
const MONGODB_URI = process.env.MONGODB_URI
const qureyIndex = MONGODB_URI.indexOf('?')
const MODIFIED_URI = MONGODB_URI.slice(0, qureyIndex) + 'quickblog' + MONGODB_URI.slice(qureyIndex)
const connectDB = async () => {
    try {
        mongoose.connection.on('connected', () => console.log("Database Connected"))
        
        await mongoose.connect(MODIFIED_URI)
        
    } catch(error) {
        console.log(error.message);
    }
}

export default connectDB
