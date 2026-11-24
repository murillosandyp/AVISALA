
const express = require('express')
const router = express.Router()

const roomController = require('../controllers/roomController')
const authMiddleware = require('../middleware/authMiddleware')
const roleMiddleware = require('../middleware/roleMiddleware')

// PUBLIC ROUTES
router.get('/', roomController.getRooms)
router.get('/:id', roomController.getRoomById)

// ADMIN-ONLY ROUTES
router.post(
  '/',
  authMiddleware,
  roleMiddleware('admin'),
  roomController.createRoom
)

router.put(
  '/:id',
  authMiddleware,
  roleMiddleware('admin'),
  roomController.updateRoom
)

router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware('admin'),
  roomController.deleteRoom
)

module.exports = router
