import { createContext, useContext, useEffect, useState } from 'react';
import  supabase  from '../config/index';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // User ka data store karne ke liye
  const [loading, setLoading] = useState(true); // Loading state jab tak auth check ho raha ho

  useEffect(() => {
    // 1. Current session check karein jab app pehli baar load ho
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null); // Agar session hai to user set karein warna null
      setLoading(false);
    };
    getSession();

    // 2. Auth changes listen karein (Login/Logout par automatically update hoga)
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => authListener.subscription.unsubscribe(); // Cleanup listener
  }, []);

  return (
    // 'user' value ab poore app mein available hogi
    <AuthContext.Provider value={{ user }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Custom hook taake har page par useAuth() call karke user ka pata lagaya ja sake
export const useAuth = () => useContext(AuthContext);