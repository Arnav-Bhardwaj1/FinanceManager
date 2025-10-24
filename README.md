# Finova: Finance & Expense Management Platform
  
AI-driven expense management platform built with the MERN stack, featuring an integrated AI chatbot for financial insights. The app provides secure authentication, comprehensive expense tracking, savings goals management, and interactive analytics charts for smarter money management.

## Live Demo:

**👉 [View Live Application: https://finance1manager.netlify.app](https://finance1manager.netlify.app)**

## Key Features

- AI-powered chatbot for financial queries & insights  
- User Authentication (JWT)  
- Create, Read, Update, and Delete (CRUD) Expenses  
- Savings Goals with progress tracking  
- Real-time Updates
- Expense Reports and Interactive Charts & Graphs  
- Date Filtering: Month-based expense filtering
- Empty State Design: Engaging empty states with clear call-to-actions
- Secure Data Management  

### **Savings Goals**
- **Goal Tracking**: Set and monitor savings targets
- **Progress Visualization**: Visual progress bars and statistics
- **Contribution History**: Track all contributions with detailed history
- **Smart Status System**: Automatic goal status detection (completed, overdue, urgent)
- **Statistics Overview**: Comprehensive goal analytics

### **AI Integration**
- **Smart Chatbot**: AI-powered financial insights and recommendations
- **Spending Analysis**: Automatic pattern recognition and suggestions
- **Budget Recommendations**: AI-driven budget optimization tips

### 🔐 **Security & Authentication**
- **JWT Authentication**: Secure token-based authentication
- **Protected Routes**: Secure access to all application features
- **User Management**: Complete user registration and login system

## 🛠 Tech Stack  

### **Frontend**
- **React.js** - Modern UI framework
- **Material-UI (MUI)** - Component library with custom theming
- **Recharts** - Interactive data visualization
- **React Router** - Client-side routing
- **Context API** - State management

### **Backend**
- **Node.js** with **Express.js** - Server framework
- **MongoDB** - NoSQL database
- **JWT** - Authentication tokens
- **Mongoose** - MongoDB object modeling

### **Deployment**
- **Netlify** - Frontend hosting with auto-deployment
- **Render** - Backend hosting with auto-deployment

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd FinanceManager
   ```

2. **Install dependencies**
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
   cd frontend
   npm run dev
   ```

5. **Access the Application**
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:5000`

## 📁 Project Structure

```
FinanceManager/
├── backend/                    # Node.js/Express server
│   ├── controllers/            # Route controllers
│   │   ├── authController.js   # Authentication logic
│   │   ├── expenseController.js # Expense management
│   │   └── savingsGoalController.js # Savings goals
│   ├── middleware/             # Authentication middleware
│   ├── models/                 # MongoDB schemas
│   │   ├── User.js            # User model
│   │   ├── Expense.js         # Expense model
│   │   └── savingsGoal.js     # Savings goal model
│   ├── routes/                 # API endpoints
│   ├── services/               # Business logic
│   └── server.js              # Main server file
├── frontend/                   # React application
│   ├── components/             # Reusable UI components
│   │   ├── Layout.jsx         # Main layout with navigation
│   │   ├── ProtectedRoute.jsx # Route protection
│   │   └── analytics/         # Analytics components
│   ├── context/                # React context providers
│   │   ├── AuthContext.jsx    # Authentication state
│   │   ├── ExpenseContext.jsx # Expense management
│   │   ├── SavingsContext.jsx # Savings goals
│   │   └── ThemeContext.jsx   # Theme management
│   ├── pages/                  # Application pages
│   │   ├── Analytics.jsx      # Unified analytics dashboard
│   │   ├── Expenses.jsx       # Expense management
│   │   ├── SavingsGoals.jsx   # Savings goals
│   │   ├── Login.jsx          # User authentication
│   │   └── Register.jsx       # User registration
│   ├── services/               # API service functions
│   ├── utils/                  # Helper functions
│   └── AppRoutes.jsx          # Application routing
└── README.md
```

## Design Features

- **Glass Morphism**: Modern glass-like UI effects
- **Gradient Accents**: Beautiful color gradients throughout
- **Smooth Animations**: Fade, slide, and hover transitions
- **Interactive Elements**: Clearly defined clickable areas
- **Responsive Layout**: Optimized for desktop and mobile
- **Dark Theme**: Modern dark mode as default
- **Visual Hierarchy**: Clear information architecture

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
