import { useState } from 'react';
import {
  PencilIcon,
  TrashIcon,
  UserPlusIcon,
} from '@heroicons/react/24/outline';

interface User {
  id: string;
  name: string;
  role: string;
  lastActive: string;
}

export function UserManagement() {
  const [users] = useState<User[]>([
    {
      id: '1',
      name: 'Alex Johnson',
      role: 'Admin',
      lastActive: '9:30 AM'
    },
    {
      id: '2',
      name: 'Bob Smith',
      role: 'Analyst',
      lastActive: '11:32 AM'
    },
    {
      id: '3',
      name: 'Catherine Lee',
      role: 'User',
      lastActive: '1:15 PM'
    }
  ]);

  const activityLogs = [
    {
      id: '1',
      user: 'Alex Johnson',
      action: 'logged in at',
      time: '9:30 AM'
    },
    {
      id: '2',
      user: 'Bob Smith',
      action: 'updated user settings at',
      time: '11:32 AM'
    },
    {
      id: '3',
      user: 'Catherine Lee',
      action: 'reviewed AI insights at',
      time: '1:15 PM'
    }
  ];

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900 p-6">
      <div className="grid grid-cols-3 gap-6">
        {/* User Management Section */}
        <div className="col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              Manage Users
            </h2>
            <button className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
              <UserPlusIcon className="h-5 w-5 mr-2" />
              Add New User
            </button>
          </div>

          <div className="space-y-4">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-600" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      {user.name}
                    </h3>
                    <p className="text-sm text-gray-500">{user.role}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-red-600">
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Logs Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
            Activity Logs
          </h2>
          <div className="space-y-4">
            {activityLogs.map((log) => (
              <div
                key={log.id}
                className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <p className="text-sm text-gray-900 dark:text-white">
                  <span className="font-medium">{log.user}</span>{' '}
                  {log.action}{' '}
                  <span className="text-gray-500">{log.time}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
