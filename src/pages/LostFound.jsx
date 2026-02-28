import React, { useState, useEffect } from 'react';
import supabase from '../config'; // Supabase connection import
import Swal from 'sweetalert2'; // Stylish alerts ke liye

const LostFound = () => {
  // --- 1. STATES (Data store karne ke liye) ---
  const [items, setItems] = useState([]); // Database se aane wali items ki list
  const [loading, setLoading] = useState(true); // Loading screen ke liye
  const [searchTerm, setSearchTerm] = useState(''); // Search box ki text
  const [filterCampus, setFilterCampus] = useState('All'); // Campus filter ki state
  const [filterCategory, setFilterCategory] = useState('All'); // Lost/Found filter
  const [user, setUser] = useState(null); // Login user ka data
  const [editId, setEditId] = useState(null); // Agar kisi post ko edit karna ho to uski ID

  // --- 2. FORM STATE (Input fields ka data) ---
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Lost',
    campus: 'Bahadurabad (Head Office)',
    image: null,
    image_url: '' // Nayi image ka URL store karne ke liye
  });

  const campuses = [
    "Bahadurabad (Head Office)", "Gulshan Campus", "North Nazimabad Campus",
    "Korangi Campus", "Malir Campus", "Orangi Campus", "Garden Campus",
    "Saddar Campus", "Hyderabad Campus", "Faisalabad Campus"
  ];

  // --- 3. USEEFFECT (Page load hote hi kya ho?) ---
  useEffect(() => {
    fetchItems(); // Database se data mangwao
    supabase.auth.getUser().then(({ data }) => setUser(data.user)); // Login user ki details lo

    // --- SUPABASE REALTIME (Live Updates) ---
    // Agar koi doosra user naya item post kare, to aapke page par fauran dikh jaye
    const channel = supabase.channel('lost_found_realtime')
      .on('postgres_changes', { 
        event: '*', // Insert, Update, Delete sab par nazar rakho
        schema: 'public', 
        table: 'lost_found_items' 
      }, () => {
        fetchItems(); // Database mein kuch bhi change ho to data dobara fetch karo
      }).subscribe();

    return () => supabase.removeChannel(channel); // Component band hone par channel hata do
  }, []);

  // --- 4. FETCH DATA (Database se data lena) ---
  const fetchItems = async () => {
    let { data, error } = await supabase
      .from('lost_found_items')
      .select('*')
      .order('created_at', { ascending: false }); // Nayi posts pehle dikhao
    
    if (!error) setItems(data);
    setLoading(false);
  };

  // --- 5. SUBMIT HANDLER (Post banana ya Update karna) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let publicUrl = formData.image_url || ''; 

      // Image Upload Logic (Agar nayi image select ki hai)
      if (formData.image && typeof formData.image !== 'string') {
        const fileName = `${Date.now()}_${formData.image.name}`;
        const { error: upErr } = await supabase.storage
          .from('portalImage') // Aapka bucket name
          .upload(fileName, formData.image);

        if (upErr) throw upErr;
        const { data } = supabase.storage.from('portalImage').getPublicUrl(fileName);
        publicUrl = data.publicUrl;
      }

      if (editId) {
        // --- UPDATE (Agar edit mode on hai) ---
        const { error } = await supabase.from('lost_found_items').update({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          campus: formData.campus,
          image_url: publicUrl // ✅ FIXED COLUMN NAME
        }).eq('id', editId); // Sirf us ID ko update karo jo select ki hai

        if (error) throw error;
        Swal.fire('Updated!', 'Your post has been updated.', 'success');
        setEditId(null); // Edit mode khatam
      } else {
        // --- INSERT (Nayi post banana) ---
        const { error } = await supabase.from('lost_found_items').insert([{
          title: formData.title,
          description: formData.description,
          category: formData.category,
          campus: formData.campus,
          image_url: publicUrl, // ✅ FIXED COLUMN NAME
          user_id: user.id,
          user_name: user.user_metadata.name,
          status: 'Pending'
        }]);

        if (error) throw error;
        Swal.fire('Posted!', 'Item has been reported.', 'success');
      }

      // Form reset kardo
      setFormData({ title: '', description: '', category: 'Lost', campus: 'Bahadurabad (Head Office)', image: null, image_url: '' });
    } catch (err) {
      Swal.fire('Error', err.message, 'error');
    }
  };

  // --- 6. EDIT BUTTON CLICK ---
  const handleEditClick = (item) => {
    setEditId(item.id); // ID set karo taake system ko pata chale edit ho raha hai
    setFormData({
      title: item.title,
      description: item.description,
      category: item.category,
      campus: item.campus,
      image_url: item.image_url,
      image: null // Purani image file state hata do
    });
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Page ko upar scroll karo form dikhane ke liye
  };

  // --- 7. DELETE LOGIC ---
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      const { error } = await supabase.from('lost_found_items').delete().eq('id', id);
      if (!error) Swal.fire('Deleted!', 'Post has been removed.', 'success');
    }
  };

  // --- 8. FILTER LOGIC (Final List taiyar karna) ---
  const filteredItems = items.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filterCampus === 'All' ? true : item.campus === filterCampus) &&
    (filterCategory === 'All' ? true : item.category === filterCategory)
  );

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 mt-10 font-sans bg-gray-50/50">
      
      {/* UI: HEADER SECTION */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border-b-8 border-[#0057a8] flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
        <div>
          <h1 className="text-3xl font-black text-[#0057a8] uppercase">Lost & <span className="text-[#66b032]">Found</span></h1>
          <p className="text-xs font-bold text-gray-400">SAYLANI IT HUB - STUDENT PORTAL</p>
        </div>
        
        {/* Filters and Search Bar */}
        <div className="flex flex-wrap gap-2">
          <input 
            type="text" placeholder="Search..." 
            className="p-3 rounded-xl bg-gray-50 border outline-none focus:border-[#66b032] w-40 md:w-56"
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
          <select className="p-3 rounded-xl bg-[#66b032] text-white font-bold outline-none cursor-pointer" onChange={(e) => setFilterCategory(e.target.value)}>
            <option value="All">All Types</option>
            <option value="Lost">Lost 🔴</option>
            <option value="Found">Found 🟢</option>
          </select>
          <select className="p-3 rounded-xl bg-[#0057a8] text-white font-bold outline-none cursor-pointer" onChange={(e) => setFilterCampus(e.target.value)}>
            <option value="All">All Campuses</option>
            {campuses.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-10">
        
        {/* UI: LEFT FORM */}
        <div className="lg:col-span-4">
          <div className={`bg-white p-8 rounded-[3rem] shadow-2xl border-2 transition-all ${editId ? 'border-orange-400' : 'border-gray-50'} sticky top-28`}>
            <h3 className="text-2xl font-bold text-[#0057a8] mb-6">{editId ? 'Edit Your Report' : 'Report an Item'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" placeholder="Item Name" required className="w-full p-4 rounded-xl bg-gray-50 outline-none border focus:border-[#66b032]" value={formData.title} onChange={(e)=>setFormData({...formData, title:e.target.value})}/>
              <textarea placeholder="Tell us more about it..." required className="w-full p-4 rounded-xl bg-gray-50 outline-none border focus:border-[#66b032] h-24" value={formData.description} onChange={(e)=>setFormData({...formData, description:e.target.value})}></textarea>

              <div className="grid grid-cols-2 gap-3">
                <select className="p-3 rounded-xl bg-gray-100 font-bold text-xs" value={formData.category} onChange={(e)=>setFormData({...formData, category:e.target.value})}>
                  <option value="Lost">Lost 🔴</option>
                  <option value="Found">Found 🟢</option>
                </select>
                <select className="p-3 rounded-xl bg-gray-100 font-bold text-xs" value={formData.campus} onChange={(e)=>setFormData({...formData, campus:e.target.value})}>
                  {campuses.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Upload UI */}
              <div className="relative border-2 border-dashed border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:border-[#66b032] transition-colors">
                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e)=>setFormData({...formData, image:e.target.files[0]})}/>
                <p className="text-xs text-gray-400 font-bold">{formData.image ? (formData.image.name || "Image selected") : "Click to Upload Photo"}</p>
              </div>

              <button className={`w-full py-4 rounded-2xl font-black text-white shadow-lg transition-all transform active:scale-95 ${editId ? 'bg-orange-500 shadow-orange-200' : 'bg-[#66b032] shadow-[#66b032]/30'}`}>
                {editId ? 'UPDATE POST' : 'POST NOW'}
              </button>
              
              {editId && (
                <button onClick={() => {setEditId(null); setFormData({title:'', description:'', category:'Lost', campus:'Bahadurabad (Head Office)', image:null, image_url:''})}} className="w-full text-gray-400 text-xs mt-2 underline">Cancel Edit</button>
              )}
            </form>
          </div>
        </div>

        {/* UI: RIGHT LIST GRID */}
        <div className="lg:col-span-8">
          <div className="grid md:grid-cols-2 gap-8">
            {filteredItems.map((item) => (
              <div key={item.id} className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all border border-gray-100 group">
                {/* Image Section */}
                <div className="h-52 bg-gray-50 relative overflow-hidden">
                  <div className={`absolute top-4 left-4 z-10 px-4 py-1 rounded-full text-[10px] font-black text-white shadow-md ${item.category === 'Lost' ? 'bg-red-500' : 'bg-[#66b032]'}`}>{item.category}</div>
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-200 font-black text-3xl italic">SAYLANI</div>
                  )}
                </div>

                {/* Info Section */}
                <div className="p-8">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-xl text-gray-800 leading-tight">{item.title}</h4>
                  </div>
                  <p className="text-[#66b032] font-black text-[10px] uppercase tracking-widest">{item.campus}</p>
                  <p className="text-gray-500 text-sm mt-4 line-clamp-2 italic leading-relaxed">"{item.description}"</p>
                  
                  <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-50">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-50 text-[#0057a8] flex items-center justify-center text-xs font-bold uppercase">{item.user_name?.charAt(0)}</div>
                      <span className="text-[10px] font-bold text-gray-400">{item.user_name}</span>
                    </div>
                    
                    {/* Actions: Sirf post banane wala dekh sake */}
                    {user && user.id === item.user_id && (
                      <div className="flex gap-2">
                        {/* Edit Button */}
                        <button onClick={() => handleEditClick(item)} className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                        </button>
                        {/* Delete Button */}
                        <button onClick={() => handleDelete(item.id)} className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LostFound;