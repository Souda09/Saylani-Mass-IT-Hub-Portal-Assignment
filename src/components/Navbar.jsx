import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import supabase from '../config/index';
import saylaniLogo from '../assets/images.png';
import { FaBell } from 'react-icons/fa';

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [hasNotification, setHasNotification] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        // Logged in user: check their personal + admin notifications
        checkUnreadNotifications(session.user.id);
      } else {
        // Not logged in: check only admin notifications
        checkUnreadNotifications(null);
      }
    });
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkUnreadNotifications(session.user.id);
      } else {
        checkUnreadNotifications(null);
      }
    });

    // REALTIME SUBSCRIPTION
    const channel = supabase
      .channel('notifications-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
        },
        (payload) => {
          // Trigger dot if:
          // 1. Notification is for currently logged in user
          // 2. Notification is general admin notification (user_id is null)
          if (payload.new.user_id === user?.id || payload.new.user_id === null) {
            setHasNotification(true);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, [user?.id]); // Re-run effect when user login status changes

  const checkUnreadNotifications = async (userId) => {
    let query = supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true }) // 'head: true' for performance
      .eq('is_read', false);
      
    if (userId) {
      // User logged in: check their ID OR Admin Notifications
      query = query.or(`user_id.eq.${userId},user_id.is.null`);
    } else {
      // Not logged in: check only Admin Notifications
      query = query.is('user_id', null);
    }

    const { count } = await query;
      
    if (count > 0) setHasNotification(true);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsOpen(false);
    navigate('/login');
  };

  const closeMenu = () => setIsOpen(false);

  const handleNotificationClick = async () => {
    setHasNotification(false);
    // Mark as read in database
    if (user) {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .or(`user_id.eq.${user.id},user_id.is.null`)
        .eq('is_read', false);
    } else {
      // If not logged in, you might not be able to update, or handle differently
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .is('user_id', null)
        .eq('is_read', false);
    }
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-white shadow-lg border-b-4 border-[#66b032]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <Link to="/dashboard" onClick={closeMenu} className="flex-shrink-0 transition-transform hover:scale-105">
            <img src={saylaniLogo} alt="Logo" className="w-28 md:w-36" />
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/dashboard" className={`font-bold ${location.pathname === '/dashboard' ? 'text-[#66b032]' : 'text-[#0057a8]'}`}>Dashboard</Link>
            <Link to="/lost-found" className={`font-bold ${location.pathname === '/lost-found' ? 'text-[#66b032]' : 'text-[#0057a8]'}`}>Lost & Found</Link>
            <Link to="/complaints" className={`font-bold ${location.pathname === '/complaints' ? 'text-[#66b032]' : 'text-[#0057a8]'}`}>Complaints</Link>
            <Link to="/volunter" className={`font-bold ${location.pathname === '/volunter' ? 'text-[#66b032]' : 'text-[#0057a8]'}`}>Volunteer</Link>
            
            <div className="flex items-center gap-4 border-l pl-6 ml-2">
              <div className="relative cursor-pointer" onClick={handleNotificationClick}>
                <FaBell className="text-[#0057a8] text-xl" />
                {hasNotification && (
                  <span className="absolute -top-1 -right-1 block h-2.5 w-2.5 rounded-full ring-2 ring-white bg-red-500 animate-pulse"></span>
                )}
              </div>
              <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-full text-xs font-bold transition-all transform hover:-translate-y-1">Logout</button>
            </div>
          </div>
          
          {/* Mobile Menu Button - Hamburger */}
          <div className="md:hidden flex items-center gap-4">
              <div className="relative cursor-pointer" onClick={handleNotificationClick}>
                <FaBell className="text-[#0057a8] text-xl" />
                {hasNotification && (
                  <span className="absolute -top-1 -right-1 block h-2.5 w-2.5 rounded-full ring-2 ring-white bg-red-500 animate-pulse"></span>
                )}
              </div>
              <button onClick={() => setIsOpen(!isOpen)} className="text-[#0057a8] focus:outline-none p-2 rounded-md hover:bg-gray-100">
                {isOpen ? <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg> : <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" /></svg>}
              </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu Links */}
      <div className={`md:hidden ${isOpen ? 'block' : 'hidden'} bg-white border-t`}>
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/dashboard" className="block px-3 py-2 text-base font-medium text-gray-700">Dashboard</Link>
            <Link to="/lost-found" className="block px-3 py-2 text-base font-medium text-gray-700">Lost & Found</Link>
            <Link to="/complaints" className="block px-3 py-2 text-base font-medium text-gray-700">Complaints</Link>
            <Link to="/volunter" className="block px-3 py-2 text-base font-medium text-gray-700">Volunteer</Link>
          </div>
      </div>
    </nav>
  );
};

export default Navbar;