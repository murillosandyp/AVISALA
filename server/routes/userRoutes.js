
const express = require('express')
const router = express.Router()

const userController = require('../controllers/userController')
const authMiddleware = require('../middleware/authMiddleware')
const roleMiddleware = require('../middleware/roleMiddleware')

// PUBLIC ROUTES
router.post('/register', userController.registerUser)
router.post('/login', userController.loginUser)

// PROTECTED USER ROUTES
router.get('/profile', authMiddleware, userController.getProfile)
router.put('/profile', authMiddleware, userController.updateProfile)

// ADMIN CUSTOMER MANAGEMENT
router.get(
  '/customers',
  authMiddleware,
  roleMiddleware('admin'),
  userController.getAllCustomers
)

// ADMIN TEST ROUTE
router.get(
  '/admin-test',
  authMiddleware,
  roleMiddleware('admin'),
  (req, res) => {
    res.json({
      message: 'Admin access granted!',
      role: req.user.role
    })
  }
)

module.exports = router
