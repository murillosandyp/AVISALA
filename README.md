# Mi Casa Express – Mi Casa De Cagsawa

## About

Mi Casa Express is a room reservation system developed for Mi Casa De Cagsawa, a transient house accommodation. It allows customers to browse rooms, check availability, and make reservations. Administrators can manage rooms, bookings, and customer information through an admin dashboard.

## Features

- User registration and login
- Room browsing and room details
- Room availability calendar
- Booking and reservation management
- Customer profile management
- Admin dashboard
- Room management (CRUD)
- Booking status management

## Technologies Used

- Next.js, React.js, Vite
- Tailwind CSS
- Node.js and Express.js
- MongoDB and Mongoose
- Prisma
- JWT and bcryptjs
- Git and GitHub

## Group Members

| Member | Role |
|---|---|
| Sandy Murillo | Backend Developer |
| Dona | Frontend Developer |
| Abby | Project Manager |
| Eunice | Database Administrator |
| Liza | QA / Tester |

## Installation and Setup

### Prerequisites

- Node.js and npm
- Git
- MongoDB database

### 1. Clone the repository

```bash
git clone https://github.com/murillosandyp/AVISALA.git
cd AVISALA
```

### 2. Set up the backend

```bash
cd server
npm install
```

Create a `.env` file inside the `server` folder:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

### 3. Run the backend

```bash
npm run dev
```

Backend address: `http://localhost:5000`

### 4. Set up the frontend

Open another terminal from the project root:

```bash
cd client
npm install
npm run dev
```

Frontend address: `http://localhost:5173`

## Access the System

| Component | URL |
|---|---|
| Customer Website | http://localhost:5173 |
| Admin Dashboard | http://localhost:5173/admin |
| Backend API | http://localhost:5000 |

Both the frontend and backend must be running to use the system.

## Repository

GitHub: https://github.com/murillosandyp/AVISALA

**Course:** Frameworks & NoSQL Technology  
**Developed by:** AVISALA
