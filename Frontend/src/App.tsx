import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { isAuthenticated } from './auth';
import { ProtectedRoute } from './ProtectedRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Inventories from './pages/Inventories';
import InventoryDetail from './pages/InventoryDetail';
import CategoryDetail from './pages/CategoryDetail';
import AllItems from './pages/AllItems';
import Layout from './components/Layout';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={isAuthenticated() ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/register" element={isAuthenticated() ? <Navigate to="/" replace /> : <Register />} />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventories"
          element={
            <ProtectedRoute>
              <Layout>
                <Inventories />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventories/:invId"
          element={
            <ProtectedRoute>
              <Layout>
                <InventoryDetail />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventories/:invId/:catId"
          element={
            <ProtectedRoute>
              <Layout>
                <CategoryDetail />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/items"
          element={
            <ProtectedRoute>
              <Layout>
                <AllItems />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to={isAuthenticated() ? "/" : "/login"} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
