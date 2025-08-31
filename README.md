# Personal Finance Manager  

AI-driven expense management platform built with the MERN stack, featuring an integrated chatbot for financial insights. The app also provides secure authentication, expense tracking, savings goals tracking, and interactive charts for smarter money management.  

## Features  

- AI-powered chatbot for financial queries & insights  
- User Authentication (JWT)  
- Create, Read, Update, and Delete (CRUD) Expenses  
- Savings Goals with progress tracking  
- Real-time Updates with Socket.io  
- Expense Reports and Interactive Analytics  
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
finance-tracker/
├── backend/           # Node.js & Express backend
├── frontend/          # React frontend
├── README.md         
└── .gitignore       
```
