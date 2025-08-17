import { ClerkProvider } from '@clerk/clerk-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes';
import { AuthProvider } from './contexts/AuthContext';

// Initialize the query client
const queryClient = new QueryClient();

// Get the Clerk publishable key from environment variables
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

console.log('Environment variables:', {
  clerkKey: clerkPubKey ? 'Present' : 'Missing',
});

function App() {
  console.log('Rendering App component');

  if (!clerkPubKey) {
    console.error('Missing Clerk publishable key');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-red-600 text-xl font-bold">Configuration Error</h1>
          <p className="mt-2">Missing Clerk publishable key</p>
        </div>
      </div>
    );
  }

  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router>
            <div className="min-h-screen bg-gray-50">
              <AppRoutes />
            </div>
          </Router>
        </AuthProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

export default App;