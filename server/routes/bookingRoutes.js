
const express = require('express')
const router = express.Router()

const bookingController = require('../controllers/bookingController')
const authMiddleware = require('../middleware/authMiddleware')
const roleMiddleware = require('../middleware/roleMiddleware')

// USER ROUTES
router.post('/', authMiddleware, bookingController.createBooking)

router.get('/my-bookings', authMiddleware, bookingController.getMyBookings)

// DEMO PAYMENT SUBMISSION (CUSTOMER)
router.post(
  '/:id/payment',
  authMiddleware,
  bookingController.submitDemoPayment
)

// GET SINGLE BOOKING
router.get('/:id', authMiddleware, bookingController.getBookingById)

// CANCEL BOOKING (CUSTOMER)
router.put('/:id/cancel', authMiddleware, bookingController.cancelBooking)

// ADMIN ROUTES
router.get(
  '/',
  authMiddleware,
  roleMiddleware('admin'),
  bookingController.getAllBookings
)

// UPDATE BOOKING STATUS (ADMIN)
router.put(
  '/:id/status',
  authMiddleware,
  roleMiddleware('admin'),
  bookingController.updateBookingStatus
)

// REVIEW DEMO PAYMENT (ADMIN)
router.put(
  '/:id/payment-status',
  authMiddleware,
  roleMiddleware('admin'),
  bookingController.updateDemoPaymentStatus
)

module.exports = router
