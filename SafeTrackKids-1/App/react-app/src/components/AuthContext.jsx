import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from './supabase';

// 1. Create the Context
const AuthContext = createContext({});

// 2. Create the Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session when the app first loads
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth events (like logging in or logging out)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Cleanup subscription when the app closes
    return () => subscription.unsubscribe();
  }, []);

  // We only render the children (the rest of your app) once the initial session check is done
  return (
    <AuthContext.Provider value={{ user, session }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// 3. Create a custom hook to make using the context super easy
export const useAuth = () => {
  return useContext(AuthContext);
};