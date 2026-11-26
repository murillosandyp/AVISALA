# Mi Casa Express – Mi Casa De Cagsawa

**Room Reservation and Accommodation Management System**

Mi Casa Express is a room reservation and management system developed for Mi Casa De Cagsawa, a transient house and accommodation business. The system allows customers to browse rooms, view room details, and make reservations, while administrators can manage rooms, bookings, and customer information through an admin dashboard.

The project aims to make room reservation and accommodation management more convenient, organized, and accessible.

---

## Project Features

### Customer Side
- User registration and login
- Browse available rooms
- View room details, prices, capacity, and amenities
- Room reservation
- View and manage bookings
- Customer profile management

### Admin Side
- Admin dashboard
- Room management (Create, Read, Update, Delete)
- Booking management
- Customer management
- View booking details
- Manage booking status
- Monitor room availability

---

## Technologies Used

| Technology | Purpose |
|---|---|
| React | Frontend user interface |
| Next.js | Web application framework |
| Node.js | Server-side runtime |
| Express.js | Backend API |
| MongoDB | Database |
| Prisma | Database ORM |
| JavaScript | Application programming |
| TypeScript | Type-safe development |
| Tailwind CSS | UI styling |
| JWT | Authentication |
| Git & GitHub | Version control and collaboration |

---

## Group Members

| Member | Role | Responsibility |
|---|---|---|
| Sandy P. Murillo | Backend Developer | Backend logic, API, and system functionality |
| Dona | Frontend Developer | User interface and frontend implementation |
| Abby | Project Manager | Project coordination and monitoring |
| Eunice | Database Administrator | Database organization and management |
| Liza | Quality Assurance / Tester | Testing, identifying errors, and checking system functionality |

---

## Project Structure

The repository contains the system's different components and supporting files.

- `app/` – Next.js application routes and features
- `client/` – Customer-facing frontend
- `server/` – Backend API, controllers, models, and routes
- `mi-casa-mobile/` – Mobile application components
- `components/` – Reusable UI components
- `lib/` – Utilities and shared configurations
- `prisma/` – Database schema and related files, if applicable

---

## Requirements

Before installing the project on another computer, make sure the following are installed:

- [Node.js](https://nodejs.org/)
- [Git](https://git-scm.com/)
- [Visual Studio Code](https://code.visualstudio.com/) (recommended)
- MongoDB Atlas account or a configured MongoDB database

---

## Installation Guide

Follow these steps to copy the repository and run the project on another computer.

### 1. Clone the Repository

Open a terminal and run:

```bash
git clone https://github.com/murillosandyp/AVISALA.git
```

Go to the project directory:

```bash
cd AVISALA
```

### 2. Install Dependencies

Install the dependencies for the frontend:

```bash
cd client
npm install
```

Install the dependencies for the backend:

```bash
cd ../server
npm install
```

If you are also running the Next.js application located in the root directory, open another terminal in the project root and install its dependencies:

```bash
cd ..
npm install
```

### 3. Configure Environment Variables

The project requires environment variables for database connection and authentication. Create the necessary `.env` files in the appropriate directories.

**Backend – `server/.env`**

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

Replace the values with your own MongoDB connection string and secret key. Do not share your actual credentials.

**Frontend – `client/.env`**

```env
VITE_API_URL=http://localhost:5000/api
```

Make sure the frontend API URL matches the address where the backend is running.

If the Next.js application requires additional environment variables, configure them in the root `.env` file based on the project's authentication and database setup.

> Environment files are not included in the repository for security reasons. Each user must create their own local configuration.

### 4. Run the Backend Server

Open a terminal:

```bash
cd server
npm run dev
```

The backend API should run at:

```text
http://localhost:5000
```

### 5. Run the Frontend

Open another terminal:

```bash
cd client
npm run dev
```

Open the frontend URL displayed in the terminal, usually:

```text
http://localhost:5173
```

Keep both the backend and frontend terminals running while using the system.

### 6. Run the Next.js Application (If Needed)

If you need to run the Next.js application from the root directory, open another terminal:

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

---

## Database Configuration

The system uses MongoDB for data storage.

To connect the application to MongoDB:

1. Create or access your MongoDB database.
2. Obtain your MongoDB connection string.
3. Add the connection string to your `server/.env` file.
4. Make sure the database connection is properly configured.
5. Start the backend server and verify the database connection.

The application stores information related to users, rooms, and bookings.

---

## Important Notes

- Make sure Node.js and npm are properly installed.
- Make sure the database is accessible before running the application.
- Start the backend server before using frontend features that require API access.
- Do not upload `.env` files, passwords, tokens, or database credentials to GitHub.
- When cloning the project to another computer, dependencies must be installed again using `npm install`.
- Local development URLs use `localhost`, which is intended for the computer running the application.

---

## Project Purpose

This project was developed as part of our Bachelor of Science in Information Systems program to apply our knowledge of web development, database management, backend and frontend development, system integration, and software testing.

---

**Mi Casa De Cagsawa**

*Comfort Feels Like Home.*