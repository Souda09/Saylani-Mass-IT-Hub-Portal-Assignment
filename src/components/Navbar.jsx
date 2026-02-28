// import { useNavigate, Link } from 'react-router-dom';
// import supabase from '../config/index';
// import saylaniLogo from '../assets/images.png';

// function Navbar() {
//   const navigate = useNavigate();
//   // Hum localStorage ya Supabase se user name nikal sakte hain
//   const userName = JSON.parse(localStorage.getItem('sb-fscubuxvpxjvxqyqsvxh-auth-token'))?.user?.user_metadata?.name || "Student";

//   const handleLogout = async () => {
//     await supabase.auth.signOut();
//     navigate('/login');
//   };

//   return (
//     <nav className="bg-white px-8 py-3 shadow-md flex justify-between items-center border-b-4 border-[#66b032] fixed top-0 w-full z-50">
//       {/* Left: Logo */}
//       <Link to="/dashboard">
//         <img src={saylaniLogo} className="w-32" alt="Logo" />
//       </Link>

//       {/* Middle: Links */}
//       <div className="flex gap-8 text-[#0057a8] font-bold">
//         <Link to="/lost-found" className="hover:text-[#66b032] transition-all">Lost/Found</Link>
//         <Link to="/complaints" className="hover:text-[#66b032] transition-all">Complaints</Link>
//         <Link to="/volunteer" className="hover:text-[#66b032] transition-all">Volunteer</Link>
//       </div>

//       {/* Right: User Info & Logout */}
//       <div className="flex items-center gap-5">
//         <div className="text-right">
//           <p className="text-sm font-bold text-gray-800 uppercase tracking-tight">{userName}</p>
//           <p className="text-[10px] text-[#66b032] font-bold">SAYLANI IT HUB</p>
//         </div>
//         <button 
//           onClick={handleLogout}
//           className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-sm transition-all"
//         >
//           LOGOUT
//         </button>
//       </div>
//     </nav>
//   );
// }

// export default Navbar;


import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import supabase from '../config/index';
import saylaniLogo from '../assets/images.png';

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [isOpen, setIsOpen] = useState(false); // Mobile menu open/close state
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    
    // Auth change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsOpen(false);
    navigate('/login');
  };

  // Jab link click ho to mobile menu band ho jaye
  const closeMenu = () => setIsOpen(false);

  return (
    <nav className="fixed top-0 w-full z-50 bg-white shadow-lg border-b-4 border-[#66b032]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          
          {/* Logo Section */}
          <Link to="/dashboard" onClick={closeMenu} className="flex-shrink-0 transition-transform hover:scale-105">
            <img src={saylaniLogo} alt="Logo" className="w-28 md:w-36" />
          </Link>

          {/* Desktop Navigation (Bari screens ke liye) */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/dashboard" className={`font-bold ${location.pathname === '/dashboard' ? 'text-[#66b032]' : 'text-[#0057a8]'}`}>Dashboard</Link>
            <Link to="/lost-found" className={`font-bold ${location.pathname === '/lost-found' ? 'text-[#66b032]' : 'text-[#0057a8]'}`}>Lost & Found</Link>
            <Link to="/complaints" className={`font-bold ${location.pathname === '/complaints' ? 'text-[#66b032]' : 'text-[#0057a8]'}`}>Complaints</Link>
            <Link to="/volunter" className={`font-bold ${location.pathname === '/volunter' ? 'text-[#66b032]' : 'text-[#0057a8]'}`}>Volunteer</Link>
            
            <div className="flex items-center gap-4 border-l pl-6 ml-2">
              <span className="text-sm font-bold text-gray-700 capitalize">{user?.user_metadata?.name || 'Student'}</span>
              <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-full text-xs font-bold transition-all transform hover:-translate-y-1">Logout</button>
            </div>
          </div>

          {/* Mobile Menu Button (Hamburger) */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="text-[#0057a8] focus:outline-none p-2 rounded-md hover:bg-gray-100 transition-colors"
            >
              {/* Toggle Icon: Jab open ho to 'X' dikhao, warna 'Hamburger' icon */}
              {isOpen ? (
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Links (Niche slide hone wala menu) */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-4 pt-2 pb-6 space-y-2 bg-gray-50 border-t border-gray-100">
          <Link to="/dashboard" onClick={closeMenu} className="block px-3 py-3 rounded-md text-base font-bold text-[#0057a8] hover:bg-[#66b032] hover:text-white transition-colors">Dashboard</Link>
          <Link to="/lost-found" onClick={closeMenu} className="block px-3 py-3 rounded-md text-base font-bold text-[#0057a8] hover:bg-[#66b032] hover:text-white transition-colors">Lost & Found</Link>
          <Link to="/complaints" onClick={closeMenu} className="block px-3 py-3 rounded-md text-base font-bold text-[#0057a8] hover:bg-[#66b032] hover:text-white transition-colors">Complaints</Link>
          <Link to="/volunter" onClick={closeMenu} className="block px-3 py-3 rounded-md text-base font-bold text-[#0057a8] hover:bg-[#66b032] hover:text-white transition-colors">Volunteer</Link>
          
          <div className="pt-4 border-t border-gray-200 mt-4 flex items-center justify-between px-3">
             <span className="font-bold text-gray-700">{user?.user_metadata?.name}</span>
             <button onClick={handleLogout} className="bg-red-500 text-white px-6 py-2 rounded-lg font-bold text-sm">Logout</button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;