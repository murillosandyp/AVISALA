
const express = require('express')
const cors = require('cors')
require('dotenv').config()

// Database connection
const connectDB = require('./config/db')

// Routes
const userRoutes = require('./routes/userRoutes')
const roomRoutes = require('./routes/roomRoutes')
const bookingRoutes = require('./routes/bookingRoutes')

// Initialize Express
const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())

// FIX: Increase request body size limit for profile photo uploads
app.use(express.json({ limit: '5mb' }))
app.use(express.urlencoded({ extended: true, limit: '5mb' }))

// API Routes
app.use('/api/users', userRoutes)
app.use('/api/rooms', roomRoutes)
app.use('/api/bookings', bookingRoutes)

// Home / API Test Route
app.get('/', (req, res) => {
  res.json({
    message: 'Mi Casa Express API is running!',
    database: 'Connected'
  })
})

// Error Handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err.message)

  if (err.status === 413 || err.type === 'entity.too.large') {
    return res.status(413).json({
      message: 'Image is too large. Please upload a smaller photo.'
    })
  }

  res.status(err.status || 500).json({
    message: err.message || 'Internal server error.'
  })
})

// Start Server
const startServer = async () => {
  try {
    await connectDB()

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`)
    })
  } catch (error) {
    console.error('Server startup failed:', error.message)
  }
}

startServer()
