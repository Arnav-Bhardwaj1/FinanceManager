# Finova: Finance & Expense Management Platform
  
AI-driven expense management platform built with the MERN stack, featuring an integrated AI chatbot for financial insights. The app provides secure authentication, comprehensive expense tracking, budget management with email notifications, savings goals management, and interactive analytics charts for smarter money management.

## Live Demo:

**👉 [View Live Application: https://finance1manager.netlify.app](https://finance1manager.netlify.app)**

## Key Features

- AI-powered chatbot for financial queries & insights  
- User Authentication (JWT) with Google OAuth support
- Create, Read, Update, and Delete (CRUD) Expenses  
- **Budget Management** with category-based monthly budgets
- **Email Notifications** for budget alerts via Gmail SMTP
- Savings Goals with progress tracking  
- Real-time Updates
- Expense Reports and Interactive Charts & Graphs  
- Date Filtering: Month-based expense filtering
- Empty State Design: Engaging empty states with clear call-to-actions
- Secure Data Management  

### **Budget Management** 🆕
- **Category-Based Budgets**: Set monthly budgets for each expense category
- **Real-Time Tracking**: Automatic spending vs budget calculations
- **Email Alerts**: Email notifications when budget thresholds are reached
- **Visual Progress Indicators**: Color-coded progress bars (on track, warning, exceeded)
- **Budget Statistics**: Overall budget overview with category breakdown
- **Configurable Thresholds**: Customize alert thresholds (0-100%)
- **Automated Checks**: Scheduled budget monitoring every 6 hours
- **HTML Email Templates**: Professional budget alert emails with progress visualization

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
- **Nodemailer** - Email service integration (Gmail SMTP)
- **node-cron** - Scheduled task execution for budget checks

### **Testing**
- **Jest** - Backend unit and integration testing
- **Supertest** - API endpoint testing
- **Vitest** - Frontend unit testing
- **React Testing Library** - Component testing

### **Deployment**
- **Netlify** - Frontend hosting with auto-deployment
- **Render** - Backend hosting with auto-deployment
- **Docker** - Containerization for easy deployment

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
3. Create a `.env` file in the backend directory with your MongoDB connection string, JWT 
secret and other credentials.
4. **Start the development servers:**
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

## 🐳 Docker Setup

The application can be run entirely using Docker:

### Quick Start with Docker

1. **Build and run all services**:
   ```bash
   docker-compose up --build
   ```

2. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - MongoDB: Running in container

### Development with Docker

```bash
docker-compose -f docker-compose.dev.yml up --build
```
## 📁 Project Structure

```
FinanceManager/
├── backend/                    # Node.js/Express server
│   ├── controllers/            # Route controllers
│   │   ├── authController.js   # Authentication logic
│   │   ├── expenseController.js # Expense management
│   │   ├── savingsGoalController.js # Savings goals
│   │   └── budgetController.js # Budget management
│   ├── middleware/             # Authentication middleware
│   ├── models/                 # MongoDB schemas
│   │   ├── User.js            # User model
│   │   ├── Expense.js         # Expense model
│   │   ├── savingsGoal.js     # Savings goal model
│   │   └── Budget.js          # Budget model
│   ├── routes/                 # API endpoints
│   │   ├── authRoutes.js     # Authentication routes
│   │   ├── expenseRoutes.js  # Expense routes
│   │   ├── savingsGoalRoutes.js # Savings goal routes
│   │   └── budgetRoutes.js    # Budget routes
│   ├── services/               # Business logic
│   │   ├── emailService.js    # Email notification service
│   │   └── budgetNotificationService.js # Budget alert service
│   └── app.js                 # Main server file
├── frontend/                   # React application
│   ├── components/             # Reusable UI components
│   │   ├── Layout.jsx         # Main layout with navigation
│   │   ├── ProtectedRoute.jsx # Route protection
│   │   └── analytics/         # Analytics components
│   ├── context/                # React context providers
│   │   ├── AuthContext.jsx    # Authentication state
│   │   ├── ExpenseContext.jsx # Expense management
│   │   ├── SavingsContext.jsx # Savings goals
│   │   ├── BudgetContext.jsx  # Budget management
│   │   └── ThemeContext.jsx   # Theme management
│   ├── pages/                  # Application pages
│   │   ├── Analytics.jsx      # Unified analytics dashboard
│   │   ├── Expenses.jsx       # Expense management
│   │   ├── Budgets.jsx        # Budget management
│   │   ├── SavingsGoals.jsx   # Savings goals
│   │   ├── Login.jsx          # User authentication
│   │   ├── Register.jsx       # User registration
│   │   └── GoogleAuthSuccess.jsx # Google OAuth callback
│   ├── services/               # API service functions
│   │   ├── authService.js     # Authentication API
│   │   ├── expenseService.js  # Expense API
│   │   └── budgetService.js   # Budget API
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


## 📧 Email Notifications

The platform includes automated email notifications for budget alerts:

- **Automatic Checks**: Budgets are checked every 6 hours
- **Smart Alerts**: Receive emails when budget thresholds are reached
- **Professional Templates**: HTML emails with progress visualization
- **Spam Prevention**: Limits to 1 email per day per budget
- **Configurable**: Enable/disable per budget with custom thresholds

## API Endpoints:

### Budget Management
- `GET /api/budgets` - Get all budgets (optionally filtered by month)
- `POST /api/budgets` - Create or update budget
- `GET /api/budgets/:id` - Get specific budget
- `PUT /api/budgets/:id` - Update budget
- `DELETE /api/budgets/:id` - Delete budget
- `GET /api/budgets/statistics` - Get budget statistics
- `GET /api/budgets/alerts` - Get budget alerts
- `POST /api/budgets/check` - Manually trigger budget check (for testing)

## Testing:

### Run Tests

**Backend Tests:**
```bash
cd backend
npm test              # Run all tests
npm run test:watch    # Watch mode
npm test -- --coverage # With coverage report
```

**Frontend Tests:**
```bash
cd frontend
npm test             
npm run test:ui       
npm run test:coverage 
```

### Test Email Notifications

1. **Quick Test Script**:
   ```bash
   cd backend
   node test-email.js
   ```

2. **Manual Trigger**:
   - Make a POST request to `/api/budgets/check` with your JWT token

3. **Setup Test Budget**:
   - Create a budget with low threshold (10%)
   - Add expenses to exceed threshold
   - Check email inbox for alerts

## Contributing

1. Fork the repository
2. Create a feature branch
3. Write tests for new features
4. Commit your changes
5. Push to the branch
6. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
