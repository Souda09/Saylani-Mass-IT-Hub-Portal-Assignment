import React, { useState, useEffect } from 'react';
import supabase from '../config'; // Supabase connection import
import Swal from 'sweetalert2'; // Alerts aur notifications ke liye

const Complaints = () => {
  // --- 1. STATES SECTION (Data store karne ke liye) ---
  const [complaints, setComplaints] = useState([]); // Database se aane wali complaints ki list
  const [loading, setLoading] = useState(true); // Loading screen ke liye
  const [user, setUser] = useState(null); // Login user ka data

  // --- 2. FORM STATE (Input fields ka data) ---
  const [formData, setFormData] = useState({
    category: 'Internet 🌐', // Default value
    campus: 'Bahadurabad (Head Office)',
    description: ''
  });

  // --- 3. DROPDOWN OPTIONS ---
  const campuses = [
    "Bahadurabad (Head Office)", "Gulshan Campus", "North Nazimabad Campus",
    "Korangi Campus", "Malir Campus", "Orangi Campus", "Garden Campus",
    "Saddar Campus", "Hyderabad Campus", "Faisalabad Campus"
  ];

  const categories = [
    "Internet 🌐", "Electricity ⚡", "Water 💧", 
    "Maintenance 🛠️", "Security 🛡️", "Cleanliness ✨", "Other 📁"
  ];

  // --- 4. USEEFFECT (Page load hote hi kya ho?) ---
  useEffect(() => {
    fetchComplaints(); // Purani complaints fetch karo
    supabase.auth.getUser().then(({ data }) => setUser(data.user)); // Current user ki details lo

    // --- REALTIME CHANNEL (Live Updates) ---
    // Agar admin status change kare, to user ko fauran alert dikhao
    const channel = supabase.channel('complaints_live')
      .on('postgres_changes', { 
        event: 'UPDATE', // Sirf update hone par alert dikhao
        schema: 'public', 
        table: 'complaints' 
      }, (payload) => {
        // Status update hone par stylish alert (Toast)
        Swal.fire({
          title: 'Status Updated!',
          text: `Your complaint status is now "${payload.new.status}".`,
          icon: 'info',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 4000
        });
        fetchComplaints(); // List ko refresh karo
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'complaints' }, () => {
        fetchComplaints(); // Nayi complaint aane par list update karo
      })
      .subscribe();

    return () => supabase.removeChannel(channel); // Page band hone par connection hata do
  }, []);

  // --- 5. DATA FETCHING FUNCTION (Database se data lena) ---
  const fetchComplaints = async () => {
    const { data, error } = await supabase
      .from('complaints')
      .select('*')
      .order('created_at', { ascending: false }); // Nayi shikayat upar dikhao
    
    if (!error) setComplaints(data);
    setLoading(false);
  };

  // --- 6. FORM SUBMISSION (Nayi shikayat darj karna) ---
  const handleSubmit = async (e) => {
    e.preventDefault(); // Page ko reload hone se roko
    try {
      // Database mein complaint insert karo
      const { error } = await supabase.from('complaints').insert([{
        category: formData.category,
        campus: formData.campus,
        description: formData.description,
        user_id: user.id,
        user_name: user.user_metadata.name || 'Student',
        status: 'Submitted' // Shuru mein status 'Submitted' hoga
      }]);

      if (error) throw error;

      Swal.fire({
        icon: 'success',
        title: 'Complaint Submitted!',
        text: 'Your issue has been reported successfully.',
        confirmButtonColor: '#66b032'
      });
      
      setFormData({ ...formData, description: '' }); // Form khali karo
    } catch (err) {
      Swal.fire('Error', err.message, 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 mt-10 font-sans">
      
      {/* UI: HEADER SECTION */}
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
            <h3 className="text-2xl font-bold text-[#0057a8] mb-6">File a Complaint</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Campus Dropdown */}
              <div>
                <label className="text-[10px] font-black text-gray-400 ml-2">CAMPUS LOCATION</label>
                <select 
                  className="w-full p-4 mt-1 rounded-xl bg-gray-50 font-bold text-[#0057a8] outline-none border focus:border-[#66b032]"
                  value={formData.campus}
                  onChange={(e) => setFormData({...formData, campus: e.target.value})}
                >
                  {campuses.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Category Dropdown */}
              <div>
                <label className="text-[10px] font-black text-gray-400 ml-2">ISSUE CATEGORY</label>
                <select 
                  className="w-full p-4 mt-1 rounded-xl bg-gray-50 font-bold text-[#0057a8] outline-none border focus:border-[#66b032]"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                >
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              {/* Description Box */}
              <div>
                <label className="text-[10px] font-black text-gray-400 ml-2">DESCRIPTION</label>
                <textarea 
                  placeholder="Tell us what's the issue..." required 
                  className="w-full p-4 mt-1 rounded-xl bg-gray-50 h-32 outline-none border focus:border-[#66b032]"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                ></textarea>
              </div>

              {/* Submit Button */}
              <button className="w-full bg-[#0057a8] text-white py-5 rounded-2xl font-black shadow-lg hover:bg-[#003d7a] transition-all transform active:scale-95">
                SUBMIT COMPLAINT
              </button>
            </form>
          </div>
        </div>

        {/* UI: RIGHT LIST GRID */}
        <div className="lg:col-span-7">
          <h3 className="text-gray-400 font-bold mb-6 ml-4">TRACK STATUS</h3>
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-10 font-bold text-[#0057a8]">Loading Records...</div>
            ) : (
              complaints.map((item) => (
                <div key={item.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center justify-between group hover:border-[#66b032] transition-all">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[9px] font-black bg-blue-50 text-[#0057a8] px-3 py-1 rounded-full uppercase">{item.category}</span>
                      <span className="text-[9px] font-bold text-gray-300 uppercase">{item.campus}</span>
                    </div>
                    <p className="text-gray-600 text-sm font-medium line-clamp-1 italic leading-relaxed">"{item.description}"</p>
                  </div>

                  {/* Status Badges */}
                  <div className="text-right ml-4">
                    <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm ${
                      item.status === 'Resolved' ? 'bg-[#66b032] text-white' : 
                      item.status === 'In Progress' ? 'bg-orange-400 text-white' : 
                      'bg-gray-100 text-[#0057a8]'
                    }`}>
                      {item.status}
                    </span>
                    <p className="text-[8px] text-gray-300 mt-2 font-bold uppercase">{new Date(item.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))
            )}
            
            {/* Jab koi data na ho */}
            {!loading && complaints.length === 0 && (
              <div className="text-center py-20 bg-gray-50 rounded-[3rem] border-2 border-dashed">
                <p className="text-gray-400 font-bold uppercase">No Complaints Found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Complaints;