
const Booking = require('../models/Booking')
const Room = require('../models/Room')

// CREATE BOOKING
exports.createBooking = async (req, res) => {
  try {
    const { room, checkIn, checkOut, guests, specialRequest } = req.body

    if (!room || !checkIn || !checkOut || !guests) {
      return res.status(400).json({
        message: 'Please complete all required booking fields.'
      })
    }

    const start = new Date(checkIn)
    const end = new Date(checkOut)

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        message: 'Invalid check-in or check-out date.'
      })
    }

    if (end <= start) {
      return res.status(400).json({
        message: 'Check-out must be after check-in.'
      })
    }

    const roomData = await Room.findById(room)

    if (!roomData) {
      return res.status(404).json({
        message: 'Room not found.'
      })
    }

    if (roomData.status !== 'Available') {
      return res.status(400).json({
        message: 'This room is currently unavailable.'
      })
    }

    if (guests > roomData.capacity) {
      return res.status(400).json({
        message: `This room can only accommodate ${roomData.capacity} guests.`
      })
    }

    if (guests < 1 || !Number.isInteger(Number(guests))) {
      return res.status(400).json({
        message: 'Guest count must be at least 1.'
      })
    }

    // CHECK EXISTING BOOKINGS
    const conflictingBooking = await Booking.findOne({
      room,
      status: { $in: ['Pending', 'Confirmed'] },
      checkIn: { $lt: end },
      checkOut: { $gt: start }
    })

    if (conflictingBooking) {
      return res.status(400).json({
        message: 'This room is already booked for the selected dates.'
      })
    }

    // CALCULATE NUMBER OF NIGHTS
    const nights = Math.ceil(
      (end - start) / (1000 * 60 * 60 * 24)
    )

    const totalPrice = nights * roomData.price

    const booking = await Booking.create({
      user: req.user.id,
      room,
      checkIn: start,
      checkOut: end,
      guests: Number(guests),
      totalPrice,
      specialRequest
    })

    const populatedBooking = await Booking.findById(booking._id)
      .populate('room')
      .populate('user', 'fullName email')

    res.status(201).json({
      message: 'Booking created successfully!',
      booking: populatedBooking
    })
  } catch (error) {
    res.status(500).json({
      message: 'Failed to create booking.',
      error: error.message
    })
  }
}

// GET MY BOOKINGS
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate('room')
      .sort({ createdAt: -1 })

    res.json({
      count: bookings.length,
      bookings
    })
  } catch (error) {
    res.status(500).json({
      message: 'Failed to retrieve your bookings.',
      error: error.message
    })
  }
}

// GET ALL BOOKINGS (ADMIN)
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('room')
      .populate('user', 'fullName email')
      .sort({ createdAt: -1 })

    res.json({
      count: bookings.length,
      bookings
    })
  } catch (error) {
    res.status(500).json({
      message: 'Failed to retrieve bookings.',
      error: error.message
    })
  }
}

// GET SINGLE BOOKING
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('room')
      .populate('user', 'fullName email')

    if (!booking) {
      return res.status(404).json({
        message: 'Booking not found.'
      })
    }

    // USER CAN ONLY VIEW THEIR OWN BOOKING
    if (
      req.user.role !== 'admin' &&
      booking.user._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        message: 'You are not allowed to view this booking.'
      })
    }

    res.json(booking)
  } catch (error) {
    res.status(500).json({
      message: 'Failed to retrieve booking.',
      error: error.message
    })
  }
}

// SUBMIT DEMO PAYMENT (CUSTOMER)
exports.submitDemoPayment = async (req, res) => {
  try {
    const { method } = req.body

    // ALLOW ONLY THE DEMO PAYMENT OPTIONS
    if (!['GCash', 'MariBank'].includes(method)) {
      return res.status(400).json({
        message: 'Invalid demo payment method.'
      })
    }

    const booking = await Booking.findById(req.params.id)

    if (!booking) {
      return res.status(404).json({
        message: 'Booking not found.'
      })
    }

    // USER CAN ONLY SUBMIT PAYMENT FOR THEIR OWN BOOKING
    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({
        message: 'You are not allowed to submit payment for this booking.'
      })
    }

    if (booking.status === 'Cancelled') {
      return res.status(400).json({
        message: 'Cancelled bookings cannot receive payment submissions.'
      })
    }

    if (booking.payment?.paymentStatus === 'Verified') {
      return res.status(400).json({
        message: 'This payment has already been verified.'
      })
    }

    if (booking.payment?.paymentStatus === 'Submitted') {
      return res.status(400).json({
        message: 'A demo payment has already been submitted for this booking.'
      })
    }

    // SAVE DEMO PAYMENT STATUS
    booking.payment.method = method
    booking.payment.paymentStatus = 'Submitted'
    booking.payment.submittedAt = new Date()

    // DEMO ONLY — NO REAL PAYMENT OR RECEIPT IS PROCESSED
    await booking.save()

    const updatedBooking = await Booking.findById(booking._id)
      .populate('room')
      .populate('user', 'fullName email')

    res.json({
      message: 'Demo payment submission saved successfully!',
      booking: updatedBooking
    })
  } catch (error) {
    res.status(500).json({
      message: 'Failed to submit demo payment.',
      error: error.message
    })
  }
}

// UPDATE DEMO PAYMENT STATUS (ADMIN)
exports.updateDemoPaymentStatus = async (req, res) => {
  try {
    const { paymentStatus } = req.body

    // ALLOW ONLY ADMIN REVIEW RESULTS
    if (!['Verified', 'Rejected'].includes(paymentStatus)) {
      return res.status(400).json({
        message: 'Invalid payment status. Use Verified or Rejected.'
      })
    }

    const booking = await Booking.findById(req.params.id)

    if (!booking) {
      return res.status(404).json({
        message: 'Booking not found.'
      })
    }

    // PAYMENT MUST BE SUBMITTED FIRST
    if (booking.payment?.paymentStatus !== 'Submitted') {
      return res.status(400).json({
        message: 'Only submitted demo payments can be reviewed.'
      })
    }

    booking.payment.paymentStatus = paymentStatus

    if (paymentStatus === 'Verified') {
      booking.payment.verifiedAt = new Date()
    } else {
      booking.payment.verifiedAt = null
    }

    await booking.save()

    const updatedBooking = await Booking.findById(booking._id)
      .populate('room')
      .populate('user', 'fullName email')

    res.json({
      message: `Demo payment marked as ${paymentStatus}.`,
      booking: updatedBooking
    })
  } catch (error) {
    res.status(500).json({
      message: 'Failed to update demo payment status.',
      error: error.message
    })
  }
}

// CANCEL MY BOOKING
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)

    if (!booking) {
      return res.status(404).json({
        message: 'Booking not found.'
      })
    }

    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({
        message: 'You are not allowed to cancel this booking.'
      })
    }

    if (booking.status === 'Cancelled') {
      return res.status(400).json({
        message: 'This booking is already cancelled.'
      })
    }

    booking.status = 'Cancelled'
    await booking.save()

    res.json({
      message: 'Booking cancelled successfully!',
      booking
    })
  } catch (error) {
    res.status(500).json({
      message: 'Failed to cancel booking.',
      error: error.message
    })
  }
}

// UPDATE BOOKING STATUS (ADMIN)
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body

    if (!['Pending', 'Confirmed', 'Cancelled'].includes(status)) {
      return res.status(400).json({
        message: 'Invalid booking status.'
      })
    }

    const booking = await Booking.findById(req.params.id)

    if (!booking) {
      return res.status(404).json({
        message: 'Booking not found.'
      })
    }

    booking.status = status
    await booking.save()

    res.json({
      message: 'Booking status updated successfully!',
      booking
    })
  } catch (error) {
    res.status(500).json({
      message: 'Failed to update booking status.',
      error: error.message
    })
  }
}
