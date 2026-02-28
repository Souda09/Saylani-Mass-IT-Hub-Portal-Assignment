// // import React, { useState } from 'react';
// // import supabase  from '../config/index';
// // import Swal from 'sweetalert2';
// // import { useNavigate } from 'react-router-dom';

// // const Login = () => {
// //   const [email, setEmail] = useState('');
// //   const [password, setPassword] = useState('');
// //   const navigate = useNavigate();

// //   const handleLogin = async (e) => {
// //     e.preventDefault();
    
// //     // Email aur password trim karke send karna (Source: login.js)
// //     const { data, error } = await supabase.auth.signInWithPassword({
// //       email: email.trim(),
// //       password: password.trim(),
// //     });

// //     if (error) {
// //       Swal.fire('Login Failed', error.message, 'error');
// //     } else {
// //       Swal.fire('Welcome!', 'Login Successful', 'success');
// //       navigate('/dashboard'); // Home page par bhejna
// //     }
// //   };

// //   return (
// //     <div className="container">
// //       <form onSubmit={handleLogin}>
// //         <h1 className="form-title">Login</h1>
// //         <input type="email" placeholder="Email" className="form-control mb-3" onChange={(e) => setEmail(e.target.value)} />
// //         <input type="password" placeholder="Password" className="form-control mb-3" onChange={(e) => setPassword(e.target.value)} />
// //         <button type="submit" className="btn-primary bg-[#0057a8]">Login</button>
// //       </form>
// //     </div>
// //   );
// // };

// // export default Login;



// import React, { useState } from 'react';
// import supabase from '../config';
// import Swal from 'sweetalert2';
// import { useNavigate, Link } from 'react-router-dom';
// import saylaniLogo from '../assets/images.png';
 
// const Login = () => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const navigate = useNavigate();

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     // Supabase se login karwa rahe hain
//     const { error } = await supabase.auth.signInWithPassword({
//       email: email.trim(),
//       password: password.trim(),
//     });

//     if (error) {
//       Swal.fire({ icon: 'error', title: 'Login Fail', text: error.message, confirmButtonColor: '#0057a8' });
//     } else {
//       Swal.fire({ icon: 'success', title: 'Welcome!', showConfirmButton: false, timer: 1500 });
//       navigate('/dashboard'); // Kamyaab login par dashboard bhejo
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-white p-6">
//       {/* Blue theme card with green accents */}
//       <div className="max-w-md w-full bg-white rounded-[2rem] p-10 border-2 border-[#0057a8]/10 shadow-[0_20px_40px_rgba(0,87,168,0.08)]">
        
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

//         <form onSubmit={handleLogin} className="space-y-5">
//           <input 
//             type="email" placeholder="Email Address"
//             className="w-full p-4 rounded-xl bg-gray-50 border border-transparent focus:border-[#0057a8] focus:ring-4 focus:ring-[#0057a8]/5 outline-none transition-all"
//             onChange={(e) => setEmail(e.target.value)} 
//           />
//           <input 
//             type="password" placeholder="Password"
//             className="w-full p-4 rounded-xl bg-gray-50 border border-transparent focus:border-[#0057a8] focus:ring-4 focus:ring-[#0057a8]/5 outline-none transition-all"
//             onChange={(e) => setPassword(e.target.value)} 
//           />
          
//           <button className="w-full bg-[#0057a8] text-white py-4 rounded-xl font-bold hover:shadow-[0_10px_25px_rgba(0,87,168,0.3)] transition-all">
//             Sign In
//           </button>
//         </form>

//         <p className="mt-10 text-center text-gray-400 text-sm font-medium">
//           New Student? <Link to="/" className="text-[#66b032] font-bold">Register Here</Link>
//         </p>
//       </div>
//     </div>
//   );
// };

// export default Login;
import React, { useState } from 'react';
import supabase from '../config';
import Swal from 'sweetalert2';
import { useNavigate, Link } from 'react-router-dom';
import saylaniLogo from '../assets/images.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password.trim(),
    });

    if (error) {
      Swal.fire({ icon: 'error', title: 'Login Fail', text: error.message, confirmButtonColor: '#0057a8' });
    } else {
      Swal.fire({ icon: 'success', title: 'Welcome!', showConfirmButton: false, timer: 1500 });
      navigate('/dashboard'); 
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6">
      <div className="max-w-md w-full bg-white rounded-[2rem] p-10 border-2 border-[#0057a8]/10 shadow-[0_20px_40px_rgba(0,87,168,0.08)]">
        <div className="text-center mb-8 flex flex-col items-center"> 
          <img src={saylaniLogo} className="w-48 h-auto mb-4" alt="Saylani Logo" />
          <h2 className="text-2xl font-bold text-gray-800">Student Login</h2>
          <div className="h-1.5 w-12 bg-[#66b032] mt-2 rounded-full"></div>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <input type="email" placeholder="Email Address" className="w-full p-4 rounded-xl bg-gray-50 border focus:border-[#0057a8] outline-none" onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" className="w-full p-4 rounded-xl bg-gray-50 border focus:border-[#0057a8] outline-none" onChange={(e) => setPassword(e.target.value)} required />
          <button className="w-full bg-[#0057a8] text-white py-4 rounded-xl font-bold hover:shadow-lg transition-all transform active:scale-95">Sign In</button>
        </form>

        <p className="mt-10 text-center text-gray-400 text-sm">New Student? <Link to="/" className="text-[#66b032] font-bold">Register Here</Link></p>
      </div>
    </div>
  );
};

export default Login;