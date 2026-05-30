import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, Loader2 } from 'lucide-react';
import { logout } from '../auth';
import { getMe } from '../api';
import type { User } from '../types';

interface LayoutProps {
  children: React.ReactNode;
}

const getPageTitle = (pathname: string): string => {
  if (pathname === '/') return 'Dashboard';
  if (pathname === '/inventories') return 'Inventories';
  if (pathname === '/items') return 'All Items';
  if (pathname.startsWith('/inventories')) return 'Inventory Details';
  return 'InvenTrack';
};

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    getMe()
      .then(data => {
        if (active) setUser(data);
      })
      .catch(() => {
        if (active) {
          logout();
          navigate('/login');
        }
      });
    return () => {
      active = false;
    };
  }, [navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string): boolean => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const pageTitle = getPageTitle(location.pathname);

  return (
    <div className="flex h-screen bg-slate-950">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 transition-transform duration-300 ease-in-out border-r border-slate-700 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 md:relative`}
      >
        <div className="flex flex-col h-full p-6">
          {/* Logo */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-indigo-400">InvenTrack</h1>
            <p className="text-xs text-slate-400 mt-1">Inventory Management</p>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 space-y-2">
            <Link
              to="/"
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive('/') && location.pathname === '/'
                  ? 'bg-indigo-500 text-white'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <span className="text-sm font-medium">Dashboard</span>
            </Link>
            <Link
              to="/inventories"
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive('/inventories')
                  ? 'bg-indigo-500 text-white'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <span className="text-sm font-medium">Inventories</span>
            </Link>
            <Link
              to="/items"
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive('/items')
                  ? 'bg-indigo-500 text-white'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <span className="text-sm font-medium">All Items</span>
            </Link>
          </nav>

          {/* User Info */}
          <div className="border-t border-slate-700 pt-4">
            <div className="mb-4">
              <p className="text-xs text-slate-400">Logged in as</p>
              <p className="text-sm font-medium text-slate-100 truncate">
                {user ? (user.name || user.email) : <Loader2 className="h-4 w-4 animate-spin inline" />}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 text-sm font-medium"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="bg-slate-900 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 hover:bg-slate-800 rounded-lg transition-colors"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <h2 className="text-xl font-semibold text-slate-100">{pageTitle}</h2>
          </div>
          <div className="hidden md:block text-sm text-slate-400">
            {user ? user.email : <Loader2 className="h-4 w-4 animate-spin inline" />}
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-6">{children}</div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
