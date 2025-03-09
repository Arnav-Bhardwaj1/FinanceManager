import { BrowserRouter } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ExpenseProvider } from './context/ExpenseContext';
import { SavingsProvider } from './context/SavingsContext';
import AppRoutes from './AppRoutes';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <CssBaseline />
        <AuthProvider>
          <ExpenseProvider>
            <SavingsProvider>
              <AppRoutes />
            </SavingsProvider>
          </ExpenseProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
