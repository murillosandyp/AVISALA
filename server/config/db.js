const mongoose = require('mongoose')

const connectDB = async () => {
  const uri = process.env.MONGODB_URI

  try {
    const parsed = new URL(uri)

    console.log('Mongo URI diagnostic:', {
      protocol: parsed.protocol,
      hostname: parsed.hostname,
      port: parsed.port || '(none)',
      hasPort: Boolean(parsed.port)
    })
  } catch (error) {
    console.log('Mongo URI diagnostic: Unable to parse URI')
  }

  while (true) {
    try {
      await mongoose.connect(uri, {
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