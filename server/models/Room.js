
const mongoose = require('mongoose')

const roomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      required: true
    },

    roomType: {
      type: String,
      required: true
    },

    price: {
      type: Number,
      required: true,
      min: 0
    },

    capacity: {
      type: Number,
      required: true,
      min: 1
    },

    amenities: {
      type: [String],
      default: []
    },

    image: {
      type: String,
      default: ''
    },

    status: {
      type: String,
      enum: ['Available', 'Unavailable'],
      default: 'Available'
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('Room', roomSchema)
