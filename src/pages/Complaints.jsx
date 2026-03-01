import React, { useState, useEffect } from 'react';
import supabase from '../config'; 
import Swal from 'sweetalert2'; 
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaTag, FaClipboardList } from 'react-icons/fa';

const Complaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // --- FORM STATE ---
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contact: '',
    category: 'Internet 🌐',
    campus: 'Bahadurabad (Head Office)',
    description: ''
  });

  // --- CONFIG: BUTTON COLOR ---
  const themeColor = '#0057a8'; // <--- Yahan se color change karein

  const campuses = [
    "Bahadurabad (Head Office)", "Gulshan Campus", "North Nazimabad Campus",
    "Korangi Campus", "Malir Campus", "Orangi Campus", "Garden Campus",
    "Saddar Campus", "Hyderabad Campus", "Faisalabad Campus"
  ];

  const categories = [
    "Internet 🌐", "Electricity ⚡", "Water 💧", 
    "Maintenance 🛠️", "Security 🛡️", "Cleanliness ✨", "Other 📁"
  ];

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser(data.user);
        fetchComplaints(data.user.id);
      }
    });

    const channel = supabase.channel('complaints_live')
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'complaints' 
      }, (payload) => {
        Swal.fire({
          title: 'Status Updated!',
          text: `Your complaint is now "${payload.new.status}".`,
          icon: 'info',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 4000,
          background: '#fff',
          color: '#333'
        });
        if (user) fetchComplaints(user.id);
      }).subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const fetchComplaints = async (userId) => {
    const { data, error } = await supabase
      .from('complaints')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (!error) setComplaints(data);
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('complaints').insert([{
        user_name: formData.name,
        user_email: formData.email,
        contact_number: formData.contact,
        category: formData.category,
        campus: formData.campus,
        description: formData.description,
        user_id: user.id,
        status: 'Submitted'
      }]);

      if (error) throw error;

      // SUCCESS ALERT - Customized Button Color
      Swal.fire({
        icon: 'success',
        title: 'Submitted!',
        text: 'Your issue has been reported.',
        confirmButtonColor: themeColor, // <--- Same color
      });
      
      setFormData({ ...formData, description: '' });
      fetchComplaints(user.id);
    } catch (err) {
      // ERROR ALERT - Customized Button Color
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: err.message,
        confirmButtonColor: themeColor, // <--- Same color
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 mt-10 font-sans">
      
      {/* UI: HEADER */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border-b-8 border-[#66b032] flex flex-col md:flex-row justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-black text-[#0057a8] uppercase italic leading-none">
            Help & <span className="text-[#66b032]">Support</span>
          </h1>
          <p className="text-[10px] font-bold text-gray-400 mt-2 tracking-widest uppercase">Saylani Complaint Portal</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-10">
        
        {/* UI: LEFT FORM */}
        <div className="lg:col-span-5">
          <div className="bg-white p-8 rounded-[3rem] shadow-2xl border border-gray-50 sticky top-28">
            <h3 className="text-2xl font-bold text-[#0057a8] mb-6 flex items-center gap-2">
                <FaClipboardList /> File a Complaint
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <FaUser className="absolute left-4 top-4 text-gray-400"/>
                <input type="text" placeholder="Full Name" required className="w-full p-3 pl-10 rounded-xl bg-gray-50 border outline-none" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="relative">
                <FaEnvelope className="absolute left-4 top-4 text-gray-400"/>
                <input type="email" placeholder="Email Address" required className="w-full p-3 pl-10 rounded-xl bg-gray-50 border outline-none" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
              </div>
              <div className="relative">
                <FaPhone className="absolute left-4 top-4 text-gray-400"/>
                <input type="text" placeholder="Contact Number" required className="w-full p-3 pl-10 rounded-xl bg-gray-50 border outline-none" value={formData.contact} onChange={(e) => setFormData({...formData, contact: e.target.value})} />
              </div>

              <select className="w-full p-3 rounded-xl bg-gray-50 border font-bold text-[#0057a8] outline-none" value={formData.campus} onChange={(e) => setFormData({...formData, campus: e.target.value})}>
                {campuses.map(c => <option key={c} value={c}>{c}</option>)}
              </select>

              <select className="w-full p-3 rounded-xl bg-gray-50 border font-bold text-[#0057a8] outline-none" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>

              <textarea placeholder="Describe your issue..." required className="w-full p-4 rounded-xl bg-gray-50 h-28 border outline-none" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}></textarea>

              <button className="w-full bg-[#0057a8] text-white py-4 rounded-xl font-black hover:bg-[#003d7a] transition-all transform active:scale-95">
                SUBMIT
              </button>
            </form>
          </div>
        </div>

        {/* UI: RIGHT LIST */}
        <div className="lg:col-span-7">
          <h3 className="text-gray-400 font-bold mb-6 ml-4">YOUR COMPLAINTS</h3>
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-10 font-bold text-[#0057a8]">Loading...</div>
            ) : complaints.map((item) => (
              <div key={item.id} className="bg-white p-6 rounded-[2rem] shadow-sm border flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[9px] font-black bg-blue-50 text-[#0057a8] px-3 py-1 rounded-full uppercase">{item.category}</span>
                    <span className="text-[9px] font-bold text-gray-300 uppercase">{item.campus}</span>
                  </div>
                  <p className="text-gray-600 text-sm font-medium line-clamp-1 italic">"{item.description}"</p>
                </div>
                <div className="text-right ml-4">
                  <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider ${
                    item.status === 'Resolved' ? 'bg-[#66b032] text-white' : 
                    item.status === 'In Progress' ? 'bg-orange-400 text-white' : 
                    'bg-gray-100 text-[#0057a8]'
                  }`}>{item.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Complaints;