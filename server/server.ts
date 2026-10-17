import 'dotenv/config'
import mongoose from 'mongoose'
import app from './app.js'
import connectDB from './configs/db.js'

if (!process.env.MONGODB_URI || !process.env.JWT_SECRET) {
    throw new Error('Set MONGODB_URI and JWT_SECRET in server/.env before starting the API.')
}

await connectDB()
if (mongoose.connection.readyState !== 1) throw new Error('Database connection failed. API was not started.')

const PORT = Number(process.env.PORT || 3000)
const server = app.listen(PORT, () => {
    console.log('Server is running on port ' + PORT)
})

const shutdown = (): void => {
    server.close(() => { void mongoose.disconnect().then(() => process.exit(0)) })
}
process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)

export default app
