
const User = require('../models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

// REGISTER USER
exports.registerUser = async (req, res) => {
  try {
    const { fullName, email, password } = req.body

    if (!fullName || !email || !password) {
      return res.status(400).json({
        message: 'Please complete all required fields.'
      })
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: 'Password must be at least 6 characters.'
      })
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase().trim()
    })

    if (existingUser) {
      return res.status(409).json({
        message: 'Email is already registered.'
      })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      role: 'user'
    })

    res.status(201).json({
      message: 'Account registered successfully!',
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        contactNumber: user.contactNumber || '',
        profilePhoto: user.profilePhoto || '',
        role: user.role
      }
    })
  } catch (error) {
    res.status(500).json({
      message: 'Registration failed.',
      error: error.message
    })
  }
}

// LOGIN USER
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required.'
      })
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim()
    })

    if (!user) {
      return res.status(401).json({
        message: 'Invalid email or password.'
      })
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      return res.status(401).json({
        message: 'Invalid email or password.'
      })
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    )

    res.json({
      message: 'Login successful!',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        contactNumber: user.contactNumber || '',
        profilePhoto: user.profilePhoto || '',
        role: user.role
      }
    })
  } catch (error) {
    res.status(500).json({
      message: 'Login failed.',
      error: error.message
    })
  }
}

// GET USER PROFILE
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password')

    if (!user) {
      return res.status(404).json({
        message: 'User not found.'
      })
    }

    res.json(user)
  } catch (error) {
    res.status(500).json({
      message: 'Failed to retrieve profile.'
    })
  }
}

// UPDATE USER PROFILE
exports.updateProfile = async (req, res) => {
  try {
    const { fullName, email, contactNumber, profilePhoto } = req.body

    if (!fullName || !email) {
      return res.status(400).json({
        message: 'Full name and email are required.'
      })
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase().trim(),
      _id: { $ne: req.user.id }
    })

    if (existingUser) {
      return res.status(409).json({
        message: 'Email is already in use.'
      })
    }

    const updateFields = {
      fullName,
      email: email.toLowerCase().trim()
    }

    if (contactNumber !== undefined) {
      updateFields.contactNumber = contactNumber
    }

    if (profilePhoto !== undefined) {
      updateFields.profilePhoto = profilePhoto
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateFields,
      { new: true, runValidators: true }
    ).select('-password')

    if (!user) {
      return res.status(404).json({
        message: 'User not found.'
      })
    }

    res.json({
      message: 'Profile updated successfully!',
      user
    })
  } catch (error) {
    res.status(500).json({
      message: 'Profile update failed.',
      error: error.message
    })
  }
}

// GET ALL CUSTOMERS (ADMIN)
exports.getAllCustomers = async (req, res) => {
  try {
    const customers = await User.find({ role: 'user' })
      .select('-password')
      .sort({ createdAt: -1 })

    res.json({
      count: customers.length,
      customers
    })
  } catch (error) {
    res.status(500).json({
      message: 'Failed to retrieve customers.',
      error: error.message
    })
  }
}
