// // import React, { useState } from 'react';
// // import supabase  from '../config/index';
// // import Swal from 'sweetalert2'; // SweetAlert import
// // import { useNavigate, Link } from 'react-router-dom';

// // const Signup = () => {
// //   // Input fields ke liye state
// //   const [name, setName] = useState('');
// //   const [contact, setContact] = useState('');
// //   const [email, setEmail] = useState('');
// //   const [password, setPassword] = useState('');
// //   const navigate = useNavigate();

// //   const handleSignup = async (e) => {
// //     e.preventDefault(); // Form refresh hone se rokna

// //     // Validation logic (Source: auth.js)
// //     if (!name || !contact || !email || !password) {
// //       Swal.fire('Error', 'Please fill all fields', 'error');
// //       return;
// //     }

// //     try {
// //       // Supabase Signup function metadata ke saath
// //       const { data, error } = await supabase.auth.signUp({
// //         email: email,
// //         password: password,
// //         options: {
// //           data: { name, contact } // Extra data user_metadata mein save hoga
// //         }
// //       });

// //       if (error) throw error;

// //       // Kamyabi ka message
// //       Swal.fire({
// //         title: 'Signup Successful!',
// //         text: 'Please check your email for verification.',
// //         icon: 'success',
// //         confirmButtonColor: '#66b032' // Saylani Green
// //       });
// //       navigate('/login');
// //     } catch (error) {
// //       Swal.fire('Error', error.message, 'error');
// //     }
// //   };

// //   return (
// //     <div className="container">
// //       <form onSubmit={handleSignup}>
// //         <h1 className="form-title">Create Account</h1>
// //         <input type="text" placeholder="Name" className="form-control mb-3" onChange={(e) => setName(e.target.value)} />
// //         <input type="text" placeholder="Contact" className="form-control mb-3" onChange={(e) => setContact(e.target.value)} />
// //         <input type="email" placeholder="Email" className="form-control mb-3" onChange={(e) => setEmail(e.target.value)} />
// //         <input type="password" placeholder="Password" className="form-control mb-3" onChange={(e) => setPassword(e.target.value)} />
// //         <button type="submit" className="btn-primary bg-[#66b032]">Submit</button>
// //         <p>Already have an account? <Link to="/login">Login here</Link></p>
// //       </form>
// //     </div>
// //   );
// // };

// // export default Signup;





// import React, { useState } from 'react';
// import supabase from '../config'; // Supabase settings lane ke liye
// import Swal from 'sweetalert2'; // Stylish alerts ke liye
// import { useNavigate, Link } from 'react-router-dom';
// import saylaniLogo from '../assets/images.png';
 
// const Signup = () => {
//   // State banai hai taake form ka data save ho sake
//   const [formData, setFormData] = useState({ name: '', contact: '', email: '', password: '' });
//   const navigate = useNavigate();

//   // Signup function jo button click par chalega
//   const handleSignup = async (e) => {
//     e.preventDefault(); // Page refresh hone se rokne ke liye
//     const { name, contact, email, password } = formData;

//     // Validation: Check kar rahe hain ke koi khana khali to nahi
//     if (!name || !contact || !email || !password) {
//       return Swal.fire({ icon: 'error', title: 'Oops!', text: 'Saray fields bharna zaroori hain', confirmButtonColor: '#66b032' });
//     }

//     try {
//       // Supabase mein account create ho raha hai
//       const { data, error } = await supabase.auth.signUp({
//         email: email,
//         password: password,
//         options: {
//           data: { name, contact } // Extra info (metadata) save kar rahe hain
//         }
//       });

//       if (error) throw error; // Agar error aaye to niche catch mein bhej do

//       Swal.fire({ icon: 'success', title: 'Mubarak ho!', text: 'Account ban gaya. Email check karein!', confirmButtonColor: '#66b032' });
//       navigate('/login'); // Login page par bhej rahe hain
//     } catch (err) {
//       Swal.fire('Error', err.message, 'error');
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-white p-6">
//       {/* Main Card: Green border aur soft shadow ke saath */}
//       <div className="max-w-md w-full bg-white rounded-[2rem] p-10 border-2 border-[#66b032]/20 shadow-[0_20px_40px_rgba(102,176,50,0.1)] animate-slide-up">
        
//         <div className="text-center mb-8 flex flex-col items-center"> 
//   {/* Flex-col aur items-center se sab kuch line mein center ho jayega */}
  
//   <img 
//     src={saylaniLogo} 
//     className="w-48 h-auto block mb-4" // 'block' aur parent ka 'items-center' isay center kar dega
//     alt="Saylani Logo" 
//   />
  
//   <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Student Registration</h2>
//   <div className="h-1.5 w-12 bg-[#66b032] mt-2 rounded-full"></div>
// </div>
//         <form onSubmit={handleSignup} className="space-y-4">
//           {/* Har input field par green focus glow hai */}
//           <input 
//             type="text" placeholder="Full Name"
//             className="w-full p-4 rounded-xl bg-gray-50 border border-gray-100 focus:border-[#66b032] focus:ring-4 focus:ring-[#66b032]/10 outline-none transition-all duration-300"
//             onChange={(e) => setFormData({...formData, name: e.target.value})} 
//           />
//           <input 
//             type="text" placeholder="Contact No"
//             className="w-full p-4 rounded-xl bg-gray-50 border border-gray-100 focus:border-[#66b032] focus:ring-4 focus:ring-[#66b032]/10 outline-none transition-all duration-300"
//             onChange={(e) => setFormData({...formData, contact: e.target.value})} 
//           />
//           <input 
//             type="email" placeholder="Email Address"
//             className="w-full p-4 rounded-xl bg-gray-50 border border-gray-100 focus:border-[#66b032] focus:ring-4 focus:ring-[#66b032]/10 outline-none transition-all duration-300"
//             onChange={(e) => setFormData({...formData, email: e.target.value})} 
//           />
//           <input 
//             type="password" placeholder="Password"
//             className="w-full p-4 rounded-xl bg-gray-50 border border-gray-100 focus:border-[#66b032] focus:ring-4 focus:ring-[#66b032]/10 outline-none transition-all duration-300"
//             onChange={(e) => setFormData({...formData, password: e.target.value})} 
//           />
          
//           <button className="w-full bg-[#66b032] text-white py-4 rounded-xl font-bold hover:shadow-[0_10px_25px_rgba(102,176,50,0.4)] transition-all transform active:scale-95">
//             Register Now
//           </button>
//         </form>

//         <p className="mt-8 text-center text-gray-500">
//           Have an account ? <Link to="/login" className="text-[#0057a8] font-bold">Login Here</Link>
//         </p>
//       </div>
//     </div>
//   );
// };

// export default Signup;


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

      // 🔥 SABSE ZAROORI LINE: Supabase auto-login rokne ke liye
      await supabase.auth.signOut(); 

      Swal.fire({ 
        icon: 'success', 
        title: 'Registration Successful!', 
        text: 'Account ban gaya hai. Ab Login karein.', 
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