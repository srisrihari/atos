import { createContext, useContext, ReactNode } from 'react';
import { useUser, useClerk } from '@clerk/clerk-react';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  userId: string | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();

  console.log('AuthProvider state:', { isLoaded, isSignedIn, userId: user?.id });

  const value = {
    isAuthenticated: !!isSignedIn,
    isLoading: !isLoaded,
    userId: user?.id || null,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}