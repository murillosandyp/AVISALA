const mongoose = require('mongoose')

const connectDB = async () => {
  while (true) {
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 10000
      })

      console.log('MongoDB connected successfully!')
      return
    } catch (error) {
      console.error('MongoDB connection failed:', error.message)
      console.log('Retrying connection in 5 seconds...')
      await new Promise(resolve => setTimeout(resolve, 5000))
    }
  }
}

module.exports = connectDB