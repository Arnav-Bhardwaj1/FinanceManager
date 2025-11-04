import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Layout from './Layout';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';

describe('Layout Component', () => {
  it('should render layout with navigation', () => {
    render(
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <Layout>
              <div>Test Content</div>
            </Layout>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    );

    expect(screen.getByText('Finance Manager')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should render navigation items', () => {
    render(
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <Layout>
              <div>Test</div>
            </Layout>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    );

    expect(screen.getByText('Analytics')).toBeInTheDocument();
    expect(screen.getByText('Expenses')).toBeInTheDocument();
    expect(screen.getByText('Budgets')).toBeInTheDocument();
    expect(screen.getByText('Savings Goals')).toBeInTheDocument();
  });
});
