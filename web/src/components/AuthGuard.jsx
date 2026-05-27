import React, { useEffect, useState } from 'react';
import { getSession, onAuthStateChange } from '../services/authService';
import LoginScreen from '../screens/LoginScreen';

export default function AuthGuard({ children }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let unsub;

    const init = async () => {
      const session = await getSession();
      setIsAuthenticated(!!session);
      setIsLoading(false);
    };

    init();

    const { data } = onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });
    unsub = data?.subscription?.unsubscribe;

    return () => {
      if (unsub) unsub();
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-brand-background">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-primary/20 border-t-brand-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return children;
}
