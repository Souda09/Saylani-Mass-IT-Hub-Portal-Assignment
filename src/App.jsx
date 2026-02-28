import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import supabase from './config/index';
import { DashboardProvider } from './context/DashboardContext'; 
import Dashboard from './pages/Dashboard'; 
import Signup from './authentication/Signup';
import Login from './authentication/Login';
import Home from './pages/Home';
import LostFound from './pages/LostFound'; 
import Complaints from './pages/Complaints'; 
import Volunter from './pages/Volunter'; 
import Navbar from './components/Navbar';
import Footer from './components/Footer';

const ADMIN_EMAIL = "admin@campus.com"; 

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Security Guard Component: Allows only Admin to access Dashboard
  const AdminRoute = ({ children }) => {
    if (!user) return <Navigate to="/login" />;
    
    if (user.email !== ADMIN_EMAIL) {
      alert(" Access Denied! Only Admin can access this page.");
      return <Navigate to="/" />; 
    }
    return children;
  };

  // 🔑 Normal Protected Route: Checks if user is logged in
  const ProtectedRoute = ({ children }) => {
    if (!user) return <Navigate to="/login" />;
    return children;
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-bold text-lg">Loading...</div>;

  return (
    <DashboardProvider>
      <Router>
        {/* --- MAIN LAYOUT --- */}
        <div className="flex flex-col min-h-screen">
          
          {/* Navbar visible only when user is logged in */}
          {user && <Navbar />} 
          
          {/* Main content area */}
          <div className={user ? "pt-24 bg-gray-50 flex-grow" : "bg-white flex-grow"}>
            <Routes>
              {/* 1. Root Path: If logged in, go to Home, else to Login */}
              <Route path="/" element={user ? <Home /> : <Navigate to="/login" />} />
              
              {/* 2. Login/Signup Paths */}
              <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
              <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/" />} />
              
              {/* 3. ADMIN ONLY Route */}
              <Route path="/dashboard" element={<AdminRoute><Dashboard /></AdminRoute>} />
              
              {/* 4. NORMAL PROTECTED Routes */}
              <Route path="/lost-found" element={<ProtectedRoute><LostFound /></ProtectedRoute>} />
              <Route path="/complaints" element={<ProtectedRoute><Complaints /></ProtectedRoute>} />
              <Route path="/volunter" element={<ProtectedRoute><Volunter /></ProtectedRoute>} />
              
              {/* 5. Catch-all: Redirect unknown URLs to "/" */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
          
          {/* Footer visible on all pages */}
          <Footer />
          
        </div>
      </Router>
    </DashboardProvider>
  );
}

export default App;