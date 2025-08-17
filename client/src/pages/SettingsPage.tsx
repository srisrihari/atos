import { useState } from 'react';
import { 
  UserCircleIcon,
  BellIcon,
  MoonIcon,
  SunIcon,
  ComputerDesktopIcon,
  LockClosedIcon,
  KeyIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

export function SettingsPage() {
  const { userId } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'appearance' | 'security' | 'integrations'>('profile');
  const [darkMode, setDarkMode] = useState<'light' | 'dark' | 'system'>('system');
  const [emailNotifications, setEmailNotifications] = useState({
    reports: true,
    insights: true,
    alerts: true,
    updates: false
  });
  
  // Sample user data
  const user = {
    name: 'Alex Johnson',
    email: 'alex@example.com',
    role: 'Data Analyst',
    organization: 'Acme Inc.',
    avatar: null
  };
  
  // Sample integrations
  const integrations = [
    { id: 'slack', name: 'Slack', connected: true, icon: '/slack-icon.svg' },
    { id: 'teams', name: 'Microsoft Teams', connected: false, icon: '/teams-icon.svg' },
    { id: 'google', name: 'Google Sheets', connected: true, icon: '/google-sheets-icon.svg' },
    { id: 'excel', name: 'Excel Online', connected: false, icon: '/excel-icon.svg' }
  ];

  const tabs = [
    { id: 'profile', name: 'Profile', icon: UserCircleIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'appearance', name: 'Appearance', icon: MoonIcon },
    { id: 'security', name: 'Security', icon: LockClosedIcon },
    { id: 'integrations', name: 'Integrations', icon: ArrowPathIcon }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Settings</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full lg:w-64 flex-shrink-0">
          <div className="bg-white dark:bg-gray-900 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`
                    w-full flex items-center px-4 py-3 text-sm font-medium
                    ${activeTab === tab.id
                      ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                      : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'}
                  `}
                >
                  <tab.icon className={`
                    h-5 w-5 mr-3
                    ${activeTab === tab.id
                      ? 'text-primary-500 dark:text-primary-400'
                      : 'text-gray-400 dark:text-gray-500'}
                  `} />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="bg-white dark:bg-gray-900 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden p-6">
            {/* Profile Settings */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Profile Information</h2>
                
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    {user.avatar ? (
                      <img
                        className="h-16 w-16 rounded-full"
                        src={user.avatar}
                        alt={user.name}
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                        <UserCircleIcon className="h-10 w-10 text-primary-600 dark:text-primary-400" />
                      </div>
                    )}
                  </div>
                  <div className="ml-4">
                    <button className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                      Change Avatar
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      defaultValue={user.name}
                      className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      defaultValue={user.email}
                      className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Role
                    </label>
                    <input
                      type="text"
                      name="role"
                      id="role"
                      defaultValue={user.role}
                      className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="organization" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Organization
                    </label>
                    <input
                      type="text"
                      name="organization"
                      id="organization"
                      defaultValue={user.organization}
                      className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {/* Notification Settings */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Notification Preferences</h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Notifications</h3>
                    <div className="mt-2 space-y-3">
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="reports"
                            name="reports"
                            type="checkbox"
                            checked={emailNotifications.reports}
                            onChange={() => setEmailNotifications({...emailNotifications, reports: !emailNotifications.reports})}
                            className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 dark:border-gray-600 rounded"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="reports" className="font-medium text-gray-700 dark:text-gray-300">Report Summaries</label>
                          <p className="text-gray-500 dark:text-gray-400">Receive weekly summaries of your reports</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="insights"
                            name="insights"
                            type="checkbox"
                            checked={emailNotifications.insights}
                            onChange={() => setEmailNotifications({...emailNotifications, insights: !emailNotifications.insights})}
                            className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 dark:border-gray-600 rounded"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="insights" className="font-medium text-gray-700 dark:text-gray-300">AI Insights</label>
                          <p className="text-gray-500 dark:text-gray-400">Get notified when AI discovers important insights</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="alerts"
                            name="alerts"
                            type="checkbox"
                            checked={emailNotifications.alerts}
                            onChange={() => setEmailNotifications({...emailNotifications, alerts: !emailNotifications.alerts})}
                            className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 dark:border-gray-600 rounded"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="alerts" className="font-medium text-gray-700 dark:text-gray-300">KPI Alerts</label>
                          <p className="text-gray-500 dark:text-gray-400">Receive alerts when KPIs exceed thresholds</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="updates"
                            name="updates"
                            type="checkbox"
                            checked={emailNotifications.updates}
                            onChange={() => setEmailNotifications({...emailNotifications, updates: !emailNotifications.updates})}
                            className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 dark:border-gray-600 rounded"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="updates" className="font-medium text-gray-700 dark:text-gray-300">Product Updates</label>
                          <p className="text-gray-500 dark:text-gray-400">Get notified about new features and updates</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Save Preferences
                  </button>
                </div>
              </div>
            )}

            {/* Appearance Settings */}
            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Appearance</h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Theme</h3>
                    <div className="mt-2 grid grid-cols-3 gap-3">
                      <div
                        className={`flex items-center justify-center rounded-md border p-3 cursor-pointer ${
                          darkMode === 'light'
                            ? 'bg-primary-50 border-primary-500 dark:bg-primary-900/30 dark:border-primary-500'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}
                        onClick={() => setDarkMode('light')}
                      >
                        <SunIcon className="h-6 w-6 text-gray-700 dark:text-gray-300" />
                        <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">Light</span>
                      </div>
                      <div
                        className={`flex items-center justify-center rounded-md border p-3 cursor-pointer ${
                          darkMode === 'dark'
                            ? 'bg-primary-50 border-primary-500 dark:bg-primary-900/30 dark:border-primary-500'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}
                        onClick={() => setDarkMode('dark')}
                      >
                        <MoonIcon className="h-6 w-6 text-gray-700 dark:text-gray-300" />
                        <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">Dark</span>
                      </div>
                      <div
                        className={`flex items-center justify-center rounded-md border p-3 cursor-pointer ${
                          darkMode === 'system'
                            ? 'bg-primary-50 border-primary-500 dark:bg-primary-900/30 dark:border-primary-500'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}
                        onClick={() => setDarkMode('system')}
                      >
                        <ComputerDesktopIcon className="h-6 w-6 text-gray-700 dark:text-gray-300" />
                        <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">System</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Save Preferences
                  </button>
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Security</h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Change Password</h3>
                    <div className="mt-2 space-y-3">
                      <div>
                        <label htmlFor="current-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Current Password
                        </label>
                        <input
                          type="password"
                          name="current-password"
                          id="current-password"
                          className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      <div>
                        <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          New Password
                        </label>
                        <input
                          type="password"
                          name="new-password"
                          id="new-password"
                          className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      <div>
                        <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          name="confirm-password"
                          id="confirm-password"
                          className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Two-Factor Authentication</h3>
                    <div className="mt-2">
                      <button
                        type="button"
                        className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        <KeyIcon className="mr-2 h-4 w-4" />
                        Enable 2FA
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Update Password
                  </button>
                </div>
              </div>
            )}

            {/* Integrations */}
            {activeTab === 'integrations' && (
              <div className="space-y-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Connected Services</h2>
                
                <div className="space-y-4">
                  {integrations.map((integration) => (
                    <div key={integration.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                          {/* In a real app, you would use the actual icon */}
                          <ArrowPathIcon className="h-6 w-6 text-gray-500" />
                        </div>
                        <div className="ml-4">
                          <h3 className="text-sm font-medium text-gray-900 dark:text-white">{integration.name}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {integration.connected ? 'Connected' : 'Not connected'}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        className={`inline-flex items-center px-3 py-1.5 border rounded-md text-sm font-medium ${
                          integration.connected
                            ? 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
                            : 'border-transparent text-white bg-primary-600 hover:bg-primary-700'
                        }`}
                      >
                        {integration.connected ? 'Disconnect' : 'Connect'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
