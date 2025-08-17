import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import Layout from './components/common/Layout';
import LoginForm from './components/auth/LoginForm';
import SignUpForm from './components/auth/SignUpForm';
import Dashboard from './components/dashboard/Dashboard';
import ProductList from './components/products/ProductList';
import SalesPage from './components/sales/SalesPage';
import RestockPage from './components/restock/RestockPage';
import ReportsPage from './components/reports/ReportsPage';
import AttendantManagement from './components/users/AttendantManagement';
import ExpensesPage from './components/expenses/ExpensesPage';


function App() {
  return (
    <ToastProvider>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
              <Routes>
                <Route path="/login" element={<LoginForm />} />
                <Route path="/signup" element={<SignUpForm />} />
                <Route path="/" element={
                  <Layout>
                    <Dashboard />
                  </Layout>
                } />
                <Route path="/products" element={
                  <Layout>
                    <ProductList />
                  </Layout>
                } />
                <Route path="/sales" element={
                  <Layout>
                    <SalesPage />
                  </Layout>
                } />
                <Route path="/restock" element={
                  <Layout>
                    <RestockPage />
                  </Layout>
                } />
                <Route path="/reports" element={
                  <Layout>
                    <ReportsPage />
                  </Layout>
                } />
                <Route path="/expenses" element={
                  <Layout>
                    <ExpensesPage />
                  </Layout>
                } />
                <Route path="/attendants" element={
                  <Layout>
                    <AttendantManagement />
                  </Layout>
                } />
              </Routes>
            </div>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </ToastProvider>
  );
}

export default App;