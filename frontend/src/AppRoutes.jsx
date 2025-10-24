import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Analytics from './pages/Analytics';
import Expenses from './pages/Expenses';
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
        element={user ? <Navigate to="/analytics" /> : <Login />} 
      />
      <Route 
        path="/register" 
        element={user ? <Navigate to="/analytics" /> : <Register />} 
      />
      
      <Route
        path="/analytics"
        element={
          <PrivateRoute>
            <Analytics />
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
        path="/savings"
        element={
          <PrivateRoute>
            <SavingsGoals />
          </PrivateRoute>
        }
      />
      
      <Route 
        path="/" 
        element={<Navigate to={user ? "/analytics" : "/login"} />} 
      />
    </Routes>
  );
};

export default AppRoutes;
