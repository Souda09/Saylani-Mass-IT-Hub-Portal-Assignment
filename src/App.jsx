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

  const AdminRoute = ({ children }) => {
    if (!user) return <Navigate to="/login" />;
    if (user.email !== ADMIN_EMAIL) {
      alert("🚫 Access Denied! Admin only.");
      return <Navigate to="/" />; 
    }
    return children;
  };

  const ProtectedRoute = ({ children }) => {
    if (!user) return <Navigate to="/login" />;
    return children;
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-bold text-lg">Loading...</div>;

  return (
    <DashboardProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          
          {/* Navbar sirf login ke baad dikhayen */}
          {user && <Navbar />} 
          
          <div className={user ? "pt-24 bg-gray-50 flex-grow" : "bg-white flex-grow"}>
            <Routes>
              {/* --- PUBLIC ROUTES --- */}
              {/* Login aur Signup ko bagair kisi protection ke rakha taake navigation smoothly chale */}
              <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
              <Route path="/signup" element={user ? <Navigate to="/" /> : <Signup />} />

              {/* --- PROTECTED ROUTES --- */}
              <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
              <Route path="/lost-found" element={<ProtectedRoute><LostFound /></ProtectedRoute>} />
              <Route path="/complaints" element={<ProtectedRoute><Complaints /></ProtectedRoute>} />
              <Route path="/volunter" element={<ProtectedRoute><Volunter /></ProtectedRoute>} />

              {/* --- ADMIN ROUTE --- */}
              <Route path="/dashboard" element={<AdminRoute><Dashboard /></AdminRoute>} />
              
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
          
          {/* FIX: Footer login/signup page par nahi dikhayen */}
          {user && <Footer />}
          
        </div>
      </Router>
    </DashboardProvider>
  );
}

export default App;