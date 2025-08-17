import React, { useEffect, useState } from 'react';
import { User, Moon, Sun, LogOut, Package, RefreshCw, Download, Menu } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import PasswordChangeModal from '../auth/PasswordChangeModal';
import QueuedActionsModal from './QueuedActionsModal';

interface NavbarProps {
  onMenuClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const { currentUser, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [queueModalOpen, setQueueModalOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstall, setShowInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    const updateStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);
    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
    };
  }, []);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches || 
        (window.navigator as any).standalone === true) {
      setIsInstalled(true);
      setShowInstall(false);
    }

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    
    // Listen for successful installation
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowInstall(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', () => {});
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowInstall(false);
        setDeferredPrompt(null);
        setIsInstalled(true);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 lg:pl-72">
        <div className="flex justify-between h-14 sm:h-16 items-center">
          {/* Hamburger for mobile */}
          <button
            className="lg:hidden p-1.5 sm:p-2 mr-1 sm:mr-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
            onClick={onMenuClick}
            aria-label="Open sidebar menu"
            type="button"
          >
            <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
          
          {/* Logo and Brand */}
          <div className="flex items-center min-w-0 flex-1">
            <Package className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <span className="ml-2 text-base sm:text-lg lg:text-xl font-bold text-gray-900 dark:text-white truncate">
              StockFlow
            </span>
          </div>

          {/* Right side controls */}
          <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-4">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-1.5 sm:p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              {isDarkMode ? <Sun className="h-4 w-4 sm:h-5 sm:w-5" /> : <Moon className="h-4 w-4 sm:h-5 sm:w-5" />}
            </button>

            {/* User info - hidden on mobile */}
            <div className="hidden sm:flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 dark:text-gray-400" />
                <div className="text-sm">
                  <p className="text-gray-900 dark:text-white font-medium truncate max-w-[120px] lg:max-w-[200px]">
                    {currentUser?.email}
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-gray-500 dark:text-gray-400 capitalize text-xs">
                      {currentUser?.role}
                    </p>
                    {currentUser?.isTemporaryPassword && (
                      <button
                        onClick={() => setShowPasswordModal(true)}
                        className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300 px-1.5 py-0.5 rounded hover:bg-yellow-200 dark:hover:bg-yellow-900/30"
                      >
                        Change Password
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 sm:p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>

            {/* Logout button for mobile */}
            <button
              onClick={handleLogout}
              className="sm:hidden p-1.5 sm:p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>

            {/* Status indicators */}
            <div className="flex items-center gap-1 sm:gap-2 lg:gap-4">
              {/* Install button */}
              {showInstall && !isInstalled && (
                <button
                  onClick={handleInstall}
                  className="hidden sm:flex items-center px-2 sm:px-3 py-1.5 sm:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 text-xs sm:text-sm font-semibold"
                  title="Install StockFlow App"
                >
                  <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden lg:inline">Install App</span>
                  <span className="lg:hidden">Install</span>
                </button>
              )}
              
              {isInstalled && (
                <span className="hidden sm:flex items-center px-2 sm:px-3 py-1.5 sm:py-2 bg-blue-100 text-blue-800 rounded-lg text-xs sm:text-sm font-semibold">
                  <Package className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden lg:inline">Installed</span>
                  <span className="lg:hidden">✓</span>
                </span>
              )}

              {/* Offline queue button */}
              <button
                onClick={() => setQueueModalOpen(true)}
                className="flex items-center px-1.5 sm:px-2 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 text-xs font-semibold"
                title="View Offline Queue"
              >
                <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span className="hidden sm:inline">Offline Queue</span>
                <span className="sm:hidden">Queue</span>
              </button>

              {/* Online/Offline status */}
              <span className={`px-1.5 sm:px-2 py-1 rounded text-xs font-semibold ${isOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                title={isOnline ? 'Online' : 'Offline'}>
                <span className="hidden sm:inline">{isOnline ? 'Online' : 'Offline'}</span>
                <span className="sm:hidden">{isOnline ? '✓' : '✗'}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <QueuedActionsModal open={queueModalOpen} onClose={() => setQueueModalOpen(false)} />
      {showPasswordModal && (
        <PasswordChangeModal
          onClose={() => setShowPasswordModal(false)}
          onSuccess={() => {
            setShowPasswordModal(false);
            // Optionally show success message
          }}
        />
      )}
    </nav>
  );
};

export default Navbar;