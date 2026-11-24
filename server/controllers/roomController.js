const Room = require('../models/Room')

// GET ALL ROOMS
exports.getRooms = async (req, res) => {
  try {
    const { search, roomType, status } = req.query

    let filter = {}

    // Search room name or description
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ]
    }

    // Filter by room type
    if (roomType) {
      filter.roomType = roomType
    }

    // Filter by availability
    if (status) {
      filter.status = status
    }

    const rooms = await Room.find(filter).sort({ createdAt: -1 })

    res.json({
      count: rooms.length,
      rooms
    })
  } catch (error) {
    res.status(500).json({
      message: 'Failed to retrieve rooms.',
      error: error.message
    })
  }
}

// GET SINGLE ROOM
exports.getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id)

    if (!room) {
      return res.status(404).json({
        message: 'Room not found.'
      })
    }

    res.json(room)
  } catch (error) {
    res.status(500).json({
      message: 'Failed to retrieve room.',
      error: error.message
    })
  }
}

// CREATE ROOM
exports.createRoom = async (req, res) => {
  try {
    const {
      name,
      description,
      roomType,
      price,
      capacity,
      amenities,
      image,
      status
    } = req.body

    if (
      !name ||
      !description ||
      !roomType ||
      price === undefined ||
      capacity === undefined
    ) {
      return res.status(400).json({
        message: 'Please complete all required room fields.'
      })
    }

    const room = await Room.create({
      name,
      description,
      roomType,
      price,
      capacity,
      amenities,
      image,
      status
    })

    res.status(201).json({
      message: 'Room created successfully!',
      room
    })
  } catch (error) {
    res.status(500).json({
      message: 'Failed to create room.',
      error: error.message
    })
  }
}

// UPDATE ROOM
exports.updateRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    )

    if (!room) {
      return res.status(404).json({
        message: 'Room not found.'
      })
    }

    res.json({
      message: 'Room updated successfully!',
      room
    })
  } catch (error) {
    res.status(500).json({
      message: 'Failed to update room.',
      error: error.message
    })
  }
}

// DELETE ROOM
exports.deleteRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id)

    if (!room) {
      return res.status(404).json({
        message: 'Room not found.'
      })
    }

    res.json({
      message: 'Room deleted successfully!'
    })
  } catch (error) {
    res.status(500).json({
      message: 'Failed to delete room.',
      error: error.message
    })
  }
}