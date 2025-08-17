import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  HomeIcon,
  ArrowUpTrayIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  BellIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
  QuestionMarkCircleIcon,
  Bars3Icon,
  XMarkIcon,
  MoonIcon,
  SunIcon,
  KeyIcon
} from '@heroicons/react/24/outline';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { signOut } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: HomeIcon },
    { name: 'Upload Data', href: '/upload', icon: ArrowUpTrayIcon },
    { name: 'Ask AI', href: '/ask-ai', icon: ChatBubbleLeftRightIcon },
    { name: 'Forecast', href: '/forecast', icon: ChartBarIcon },
    { name: 'KPI Tracker', href: '/kpi-tracker', icon: KeyIcon },
    { name: 'Reports', href: '/reports', icon: DocumentTextIcon },
    { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
  ];

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="h-screen flex bg-gray-50 dark:bg-gray-800">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-gray-600 bg-opacity-75 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar for desktop */}
      <div 
        className="hidden md:flex md:flex-shrink-0"
      >
        <div className="w-64 flex flex-col">
          {/* Sidebar component */}
          <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4">
                <span className="text-xl font-bold text-primary-600 dark:text-primary-400">InsightIQ</span>
              </div>
              <nav className="mt-5 flex-1 px-2 space-y-1">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href || 
                                  (item.href === '/' && location.pathname === '/');
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                        isActive
                          ? 'bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-300'
                          : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                      }`}
                    >
                      <item.icon
                        className={`mr-3 flex-shrink-0 h-6 w-6 ${
                          isActive ? 'text-primary-500 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500'
                        }`}
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="flex-shrink-0 flex border-t border-gray-200 dark:border-gray-700 p-4">
              <button
                onClick={toggleDarkMode}
                className="flex-shrink-0 group block w-full text-left"
              >
                <div className="flex items-center">
                  {darkMode ? (
                    <SunIcon className="h-5 w-5 text-gray-400 dark:text-gray-300 mr-3" />
                  ) : (
                    <MoonIcon className="h-5 w-5 text-gray-400 dark:text-gray-300 mr-3" />
                  )}
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {darkMode ? 'Light Mode' : 'Dark Mode'}
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 z-30 md:hidden w-full max-w-xs transform transition-transform ease-in-out duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col bg-white dark:bg-gray-900 shadow-xl">
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
            <span className="text-xl font-bold text-primary-600 dark:text-primary-400">InsightIQ</span>
            <button 
              className="text-gray-500 dark:text-gray-400"
              onClick={() => setSidebarOpen(false)}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <nav className="px-2 py-4 space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href || 
                                (item.href === '/' && location.pathname === '/');
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                      isActive
                        ? 'bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-300'
                        : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon
                      className={`mr-4 flex-shrink-0 h-6 w-6 ${
                        isActive ? 'text-primary-500 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500'
                      }`}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-gray-200 dark:border-gray-700 p-4">
            <button
              onClick={toggleDarkMode}
              className="flex-shrink-0 group block w-full text-left"
            >
              <div className="flex items-center">
                {darkMode ? (
                  <SunIcon className="h-5 w-5 text-gray-400 dark:text-gray-300 mr-3" />
                ) : (
                  <MoonIcon className="h-5 w-5 text-gray-400 dark:text-gray-300 mr-3" />
                )}
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {darkMode ? 'Light Mode' : 'Dark Mode'}
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top navigation */}
        <div className="bg-white dark:bg-gray-900 shadow-sm z-10 border-b border-gray-200 dark:border-gray-700">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <button
                  className="md:hidden text-gray-500 dark:text-gray-400"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Bars3Icon className="h-6 w-6" />
                </button>
                <div className="ml-4 md:ml-0">
                  <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {navigation.find(item => item.href === location.pathname || 
                                    (item.href === '/' && location.pathname === '/'))?.name || 'Dashboard'}
                  </h1>
                </div>
              </div>
              <div className="flex items-center">
                <div className="hidden md:ml-4 md:flex-shrink-0 md:flex md:items-center">
                  <div className="relative">
                    <div className="flex space-x-3">
                      <button className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none">
                        <BellIcon className="h-6 w-6" />
                      </button>
                      <button className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none">
                        <QuestionMarkCircleIcon className="h-6 w-6" />
                      </button>
                      <div className="relative">
                        <div>
                          <button className="flex items-center max-w-xs rounded-full focus:outline-none">
                            <UserCircleIcon className="h-8 w-8 text-gray-500 dark:text-gray-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-800 focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}