import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  BarChart3,
  Users,
  Receipt,
  X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth();

  const navItems = [
    {
      name: 'Dashboard',
      path: '/',
      icon: LayoutDashboard,
      roles: ['manager', 'admin']
    },
    {
      name: 'Products',
      path: '/products',
      icon: Package,
      roles: ['manager', 'admin', 'attendant']
    },
    {
      name: 'Sales',
      path: '/sales',
      icon: ShoppingCart,
      roles: ['manager', 'admin', 'attendant']
    },
    {
      name: 'Restock',
      path: '/restock',
      icon: TrendingUp,
      roles: ['manager', 'admin']
    },
    {
      name: 'Reports',
      path: '/reports',
      icon: BarChart3,
      roles: ['manager', 'admin']
    },
    {
      name: 'Expenses',
      path: '/expenses',
      icon: Receipt,
      roles: ['manager', 'admin']
    },
    {
      name: 'Attendants',
      path: '/attendants',
      icon: Users,
      roles: ['manager', 'admin']
    }
  ];

  const filteredNavItems = navItems.filter(item => 
    item.roles.includes(currentUser?.role || '')
  );

  // Overlay for mobile
  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black bg-opacity-40 transition-opacity duration-200 lg:hidden ${isOpen ? 'block' : 'hidden'}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg border-r border-gray-200 dark:border-gray-700 transition-transform duration-200 mt-14 sm:mt-16 transform
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:inset-0 lg:mt-16`}
        style={{ willChange: 'transform' }}
        aria-label="Sidebar"
      >
        {/* Close button for mobile */}
        <div className="lg:hidden flex justify-end p-3 sm:p-4">
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>
        <div className="flex flex-col h-full">
          <nav className="flex-1 px-3 sm:px-4 py-4 sm:py-6 space-y-1 sm:space-y-2">
            {filteredNavItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-3 sm:px-4 py-2.5 sm:py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`
                }
                onClick={onClose}
              >
                <item.icon className="mr-3 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                <span className="truncate">{item.name}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;