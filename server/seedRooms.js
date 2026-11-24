
const mongoose = require('mongoose')
const Room = require('./models/Room')
require('dotenv').config()

const rooms = [
  {
    name: 'Family Suite',
    description: 'A spacious room ideal for families and group stays.',
    roomType: 'Family Suite',
    price: 3500,
    capacity: 6,
    amenities: ['WiFi', 'Air Conditioning', 'Private Bathroom'],
    image: '',
    status: 'Available'
  },
  {
    name: 'Barkada Room',
    description: 'A comfortable space for friends traveling together.',
    roomType: 'Barkada Room',
    price: 3500,
    capacity: 6,
    amenities: ['WiFi', 'Air Conditioning', 'Private Bathroom'],
    image: '',
    status: 'Available'
  },
  {
    name: 'Couple Room',
    description: 'A cozy room for couples and relaxing stays.',
    roomType: 'Couple Room',
    price: 2200,
    capacity: 2,
    amenities: ['WiFi', 'Air Conditioning', 'Private Bathroom'],
    image: '',
    status: 'Available'
  },
  {
    name: 'Deluxe Room',
    description: 'A relaxing room with comfortable accommodation.',
    roomType: 'Deluxe Room',
    price: 2500,
    capacity: 4,
    amenities: ['WiFi', 'Air Conditioning', 'Private Bathroom'],
    image: '',
    status: 'Available'
  }
]

async function seedRooms() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to MongoDB')

    for (const room of rooms) {
      const existingRoom = await Room.findOne({ name: room.name })

      if (existingRoom) {
        console.log(`Skipped: ${room.name} already exists`)
      } else {
        await Room.create(room)
        console.log(`Added: ${room.name}`)
      }
    }

    console.log('Room restoration completed!')
  } catch (error) {
    console.error('Error:', error.message)
  } finally {
    await mongoose.disconnect()
  }
}

seedRooms()
