
import React, { useState } from 'react';
import supabase from '../config'; 
import Swal from 'sweetalert2'; 
import { useNavigate, Link } from 'react-router-dom';
import saylaniLogo from '../assets/images.png';

const Signup = () => {
  const [formData, setFormData] = useState({ name: '', contact: '', email: '', password: '' });
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    const { name, contact, email, password } = formData;

    if (!name || !contact || !email || !password) {
      return Swal.fire({ icon: 'error', title: 'Oops!', text: 'Saray fields bharna zaroori hain', confirmButtonColor: '#66b032' });
    }

    try {
      // 1. Account create ho raha hai
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: { data: { name, contact } }
      });

      if (error) throw error;

      // SABSE ZAROORI LINE: Supabase auto-login rokne ke liye
      await supabase.auth.signOut(); 

      Swal.fire({ 
        icon: 'success', 
        title: 'Registration Successful!', 
        text: 'Account has been created. Now, please log in.', 
        confirmButtonColor: '#66b032' 
      });

      // 2. Login page par bhejo
      navigate('/login'); 

    } catch (err) {
      Swal.fire('Error', err.message, 'error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6">
      <div className="max-w-md w-full bg-white rounded-[2rem] p-10 border-2 border-[#66b032]/20 shadow-[0_20px_40px_rgba(102,176,50,0.1)]">
        <div className="text-center mb-8 flex flex-col items-center"> 
          <img src={saylaniLogo} className="w-48 h-auto mb-4" alt="Saylani Logo" />
          <h2 className="text-2xl font-bold text-gray-800">Student Registration</h2>
          <div className="h-1.5 w-12 bg-[#66b032] mt-2 rounded-full"></div>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <input type="text" placeholder="Full Name" className="w-full p-4 rounded-xl bg-gray-50 border border-gray-100 focus:border-[#66b032] outline-none" onChange={(e) => setFormData({...formData, name: e.target.value})} />
          <input type="text" placeholder="Contact No" className="w-full p-4 rounded-xl bg-gray-50 border border-gray-100 focus:border-[#66b032] outline-none" onChange={(e) => setFormData({...formData, contact: e.target.value})} />
          <input type="email" placeholder="Email Address" className="w-full p-4 rounded-xl bg-gray-50 border border-gray-100 focus:border-[#66b032] outline-none" onChange={(e) => setFormData({...formData, email: e.target.value})} />
          <input type="password" placeholder="Password" className="w-full p-4 rounded-xl bg-gray-50 border border-gray-100 focus:border-[#66b032] outline-none" onChange={(e) => setFormData({...formData, password: e.target.value})} />
          <button className="w-full bg-[#66b032] text-white py-4 rounded-xl font-bold hover:shadow-lg transition-all transform active:scale-95">Register Now</button>
        </form>

        <p className="mt-8 text-center text-gray-500">Have an account? <Link to="/login" className="text-[#0057a8] font-bold">Login Here</Link></p>
      </div>
    </div>
  );
};

export default Signup;