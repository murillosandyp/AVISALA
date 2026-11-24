
const mongoose = require('mongoose')

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: true
    },

    checkIn: {
      type: Date,
      required: true
    },

    checkOut: {
      type: Date,
      required: true
    },

    guests: {
      type: Number,
      required: true,
      min: 1
    },

    totalPrice: {
      type: Number,
      required: true,
      min: 0
    },

    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Cancelled'],
      default: 'Pending'
    },

    payment: {
      method: {
        type: String,
        enum: ['GCash', 'MariBank', 'Not Selected'],
        default: 'Not Selected'
      },

      paymentStatus: {
        type: String,
        enum: ['Unpaid', 'Submitted', 'Verified', 'Rejected'],
        default: 'Unpaid'
      },

      referenceNumber: {
        type: String,
        default: ''
      },

      submittedAt: {
        type: Date,
        default: null
      },

      verifiedAt: {
        type: Date,
        default: null
      }
    },

    specialRequest: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('Booking', bookingSchema)
