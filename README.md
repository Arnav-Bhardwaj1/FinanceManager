# Personal Finance Manager

A comprehensive expense management platform built with the MERN stack (MongoDB, Express.js, React.js, Node.js).

## Features

- User Authentication
- Create, Read, Update, and Delete Expenses
- Real-time Updates
- Expense Reports and Analytics
- Secure Data Management

## Tech Stack

- Frontend: React.js
- Backend: Node.js with Express.js
- Database: MongoDB
- Authentication: JWT
- Real-time Updates: Socket.io

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```
3. Create a `.env` file in the backend directory with your MongoDB connection string and JWT secret
4. Start the development servers:
   ```bash
   # Start backend server
   cd backend
   npm run dev

   # Start frontend server
   cd ../frontend
   npm start
   ```

## Project Structure

```
finance-tracker/
├── backend/          # Node.js & Express backend
├── frontend/         # React frontend
├── README.md         # Project documentation
└── .gitignore        # Git ignore file
```
