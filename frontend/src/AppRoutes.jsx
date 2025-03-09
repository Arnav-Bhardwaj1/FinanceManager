import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Reports from './pages/Reports';
import Login from './pages/Login';
import Register from './pages/Register';
import SavingsGoals from './pages/SavingsGoals';
import { useAuth } from './context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return user ? <Layout>{children}</Layout> : <Navigate to="/login" />;
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route 
        path="/login" 
        element={user ? <Navigate to="/dashboard" /> : <Login />} 
      />
      <Route 
        path="/register" 
        element={user ? <Navigate to="/dashboard" /> : <Register />} 
      />
      
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      
      <Route
        path="/expenses"
        element={
          <PrivateRoute>
            <Expenses />
          </PrivateRoute>
        }
      />
      
      <Route
        path="/reports"
        element={
          <PrivateRoute>
            <Reports />
          </PrivateRoute>
        }
      />

      <Route
        path="/savings"
        element={
          <PrivateRoute>
            <SavingsGoals />
          </PrivateRoute>
        }
      />
      
      <Route 
        path="/" 
        element={<Navigate to={user ? "/dashboard" : "/login"} />} 
      />
    </Routes>
  );
};

export default AppRoutes;
