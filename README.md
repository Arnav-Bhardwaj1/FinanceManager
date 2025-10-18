# Personal Finance Manager  

AI-driven expense management platform built with the MERN stack, featuring an integrated AI chatbot for financial insights. The app also provides secure authentication, expense tracking, savings goals tracking, and interactive charts for smarter money management. 

## Live Demo:

**👉 [View Live Application: https://finance1manager.netlify.app](https://finance1manager.netlify.app)**

## Features

- AI-powered chatbot for financial queries & insights  
- User Authentication (JWT)  
- Create, Read, Update, and Delete (CRUD) Expenses  
- Savings Goals with progress tracking  
- Real-time Updates
- Expense Reports and Interactive Charts & Graphs  
- Secure Data Management  

## Tech Stack  

- **Frontend:** React.js  
- **Backend:** Node.js with Express.js  
- **Database:** MongoDB  
- **Authentication:** JWT  
- **Real-time Updates:** 
- **AI Integration:** AI Chatbot

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
FinanceManager/
├── backend/               # Node.js/Express server
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Authentication middleware
│   ├── models/            # MongoDB schemas
│   ├── routes/            # API endpoints
│   ├── services/          # Business logic
│   └── server.js          # Main server file
├── frontend/              # React application
│   ├── components/        # Reusable UI components
│   ├── context/           # React context providers
│   ├── pages/             # Application pages
│   ├── services/          # API service functions
│   └── utils/             # Helper functions
└── README.md     
```
