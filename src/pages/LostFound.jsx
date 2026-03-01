import React, { useState, useEffect } from 'react';
import supabase from '../config'; 
import Swal from 'sweetalert2'; 
import { FaPlus, FaTrash, FaEdit, FaSearch, FaMapMarkerAlt, FaUser, FaBoxOpen, FaClipboardList, FaTag } from 'react-icons/fa';

const LostFound = () => {
  // --- STATES ---
  const [items, setItems] = useState([]); 
  const [loading, setLoading] = useState(true); 
  const [searchTerm, setSearchTerm] = useState(''); 
  const [filterCampus, setFilterCampus] = useState('All'); 
  const [user, setUser] = useState(null); 
  const [editId, setEditId] = useState(null); 

  // --- FORM STATE ---
  const [formData, setFormData] = useState({
    user_name: '',
    category: 'Wallet', 
    image_url: '',
    status: 'Lost',
    title: '',
    description: '',
    campus: 'Bahadurabad (Head Office)',
    image: null
  });

  const categories = ["Wallet", "Clothing", "Glasses", "ID Card", "Keys", "Electronics", "Documents", "Other"];
  
  const campuses = [
    "Bahadurabad (Head Office)", "Gulshan Campus", "North Nazimabad Campus",
    "Korangi Campus", "Malir Campus", "Orangi Campus", "Garden Campus",
    "Saddar Campus", "Hyderabad Campus", "Faisalabad Campus"
  ];

  // --- USEEFFECT ---
  useEffect(() => {
    fetchItems(); 
    supabase.auth.getUser().then(({ data }) => setUser(data.user)); 

    const channel = supabase.channel('lost_found_realtime')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'lost_found_items' 
      }, () => {
        fetchItems(); 
      }).subscribe();

    return () => supabase.removeChannel(channel); 
  }, []);

  // --- FETCH DATA ---
  const fetchItems = async () => {
    let { data, error } = await supabase
      .from('lost_found_items')
      .select('*')
      .order('created_at', { ascending: false }); 
    
    if (!error) setItems(data);
    setLoading(false);
  };

  // --- SUBMIT HANDLER ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let publicUrl = formData.image_url || ''; 

      // Image Upload
      if (formData.image && typeof formData.image !== 'string') {
        const fileName = `${Date.now()}_${formData.image.name}`;
        const { error: upErr } = await supabase.storage
          .from('portalImage') 
          .upload(fileName, formData.image);

        if (upErr) throw upErr;
        const { data } = supabase.storage.from('portalImage').getPublicUrl(fileName);
        publicUrl = data.publicUrl;
      }

      const itemData = {
        user_name: formData.user_name,
        category: formData.category,
        image_url: publicUrl,
        status: formData.status,
        title: formData.title,
        description: formData.description,
        campus: formData.campus,
        user_id: user.id
      };

      if (editId) {
        const { error } = await supabase.from('lost_found_items').update(itemData).eq('id', editId);
        if (error) throw error;
        Swal.fire('Updated!', 'Your post has been updated.', 'success');
        setEditId(null);
      } else {
        const { error } = await supabase.from('lost_found_items').insert([itemData]);
        if (error) throw error;
        Swal.fire('Posted!', 'Item has been reported.', 'success');
      }

      // Reset Form
      setFormData({ user_name: '', category: 'Wallet', image_url: '', status: 'Lost', title: '', description: '', campus: 'Bahadurabad (Head Office)', image: null });
    } catch (err) {
      Swal.fire('Error', err.message, 'error');
    }
  };

  const handleEditClick = (item) => {
    setEditId(item.id);
    setFormData({
      user_name: item.user_name,
      category: item.category,
      image_url: item.image_url,
      status: item.status,
      title: item.title,
      description: item.description,
      campus: item.campus,
      image: null 
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      const { error } = await supabase.from('lost_found_items').delete().eq('id', id);
      if (!error) Swal.fire('Deleted!', 'Post has been removed.', 'success');
    }
  };

  // --- FILTER LOGIC ---
  const filteredItems = items.filter(item => 
    (item.title || '').toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filterCampus === 'All' ? true : item.campus === filterCampus)
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-4 md:p-8 font-sans">
      
      {/* HEADER & FILTERS */}
      <div className="bg-white p-6 rounded-3xl shadow-lg border-l-8 border-[#0057a8] flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-black text-gray-950">
            Lost <span className="text-[#66b032]">&</span> Found
          </h1>
          <p className="text-gray-600 font-medium">Saylani IT Hub - Student Support Portal</p>
        </div>
        
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          {/* Search Bar */}
          <div className="relative flex-grow">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"/>
            <input type="text" placeholder="Search title..." className="p-3 pl-12 rounded-xl bg-gray-50 border w-full md:w-56 focus:ring-2 focus:ring-[#0057a8]/30 outline-none" onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          
          {/* Campus Dropdown Filter */}
          <select className="p-3 rounded-xl bg-gray-50 border font-bold text-gray-700 cursor-pointer focus:ring-2 focus:ring-[#0057a8]/30 outline-none" onChange={(e) => setFilterCampus(e.target.value)}>
            <option value="All">All Campuses</option>
            {campuses.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        
        {/* LEFT FORM */}
        <div className="lg:col-span-1">
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 sticky top-28">
            <h3 className="text-xl font-bold text-gray-950 mb-6 flex items-center gap-2">
              <FaClipboardList className="text-[#0057a8]"/> {editId ? 'Edit Report' : 'New Report'}
            </h3>
            
            <div className="space-y-3">
              
              {/* User Name */}
              <div className="relative">
                <FaUser className="absolute left-4 top-4 text-gray-400"/>
                <input type="text" placeholder="Your Name" required className="w-full p-3 pl-10 rounded-xl bg-gray-50 border text-sm focus:border-[#0057a8] outline-none" value={formData.user_name} onChange={(e)=>setFormData({...formData, user_name:e.target.value})}/>
              </div>

              {/* Title */}
              <div className="relative">
                <FaTag className="absolute left-4 top-4 text-gray-400"/>
                <input type="text" placeholder="Item Title" required className="w-full p-3 pl-10 rounded-xl bg-gray-50 border text-sm focus:border-[#0057a8] outline-none" value={formData.title} onChange={(e)=>setFormData({...formData, title:e.target.value})}/>
              </div>

              {/* Campus Dropdown */}
              <select className="w-full p-3 rounded-xl bg-gray-50 border focus:border-[#0057a8] outline-none text-gray-700 text-sm" value={formData.campus} onChange={(e)=>setFormData({...formData, campus:e.target.value})}>
                {campuses.map(c => <option key={c} value={c}>{c}</option>)}
              </select>

              {/* Category Dropdown */}
              <select className="w-full p-3 rounded-xl bg-gray-50 border focus:border-[#0057a8] outline-none text-gray-700 text-sm" value={formData.category} onChange={(e)=>setFormData({...formData, category:e.target.value})}>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>

              {/* Status Dropdown */}
              <select className="w-full p-3 rounded-xl bg-gray-50 border focus:border-[#0057a8] outline-none text-gray-700 text-sm" value={formData.status} onChange={(e)=>setFormData({...formData, status:e.target.value})}>
                  <option value="Lost">Lost 🔴</option>
                  <option value="Found">Found 🟢</option>
              </select>
              
              {/* Description */}
              <textarea placeholder="Description" required className="w-full p-3 rounded-xl bg-gray-50 border focus:border-[#0057a8] outline-none h-20 text-sm" value={formData.description} onChange={(e)=>setFormData({...formData, description:e.target.value})}></textarea>

              {/* Image Upload */}
              <input type="file" className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-[#0057a8] hover:file:bg-blue-100 cursor-pointer" onChange={(e)=>setFormData({...formData, image:e.target.files[0]})}/>

              <button type="submit" className={`w-full py-3 rounded-xl font-bold text-white transition-all transform active:scale-95 ${editId ? 'bg-orange-500 hover:bg-orange-600' : 'bg-[#0057a8] hover:bg-blue-800'}`}>
                {editId ? 'Update Report' : 'Submit Report'}
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT TABLE LIST */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-100 text-xs text-gray-600 uppercase">
                  <tr>
                    <th className="p-4">Item</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Campus</th>
                    <th className="p-4">Reporter</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-blue-50/50 transition-colors">
                      <td className="p-4 flex items-center gap-4">
                        <img src={item.image_url || 'https://via.placeholder.com/50'} alt={item.title} className="w-14 h-14 rounded-xl object-cover border" />
                        <div>
                          <div className="font-bold text-gray-950 text-base">{item.title}</div>
                          <div className="text-gray-500 text-xs bg-gray-100 px-2 py-0.5 rounded-full inline-block mt-1">{item.category}</div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${item.status === 'Lost' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="p-4 text-gray-700">
                        <div className='text-sm font-semibold'>{item.campus}</div>
                      </td>
                      <td className="p-4 text-gray-700 text-xs">
                        <div className='flex items-center gap-2 mb-1'><FaUser className='text-gray-400'/> {item.user_name}</div>
                      </td>
                      <td className="p-4">
                        {user && user.id === item.user_id && (
                          <div className="flex gap-2">
                            <button onClick={() => handleEditClick(item)} className="p-3 bg-blue-50 text-[#0057a8] rounded-xl hover:bg-[#0057a8] hover:text-white transition-all">
                                <FaEdit/>
                            </button>
                            <button onClick={() => handleDelete(item.id)} className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all">
                                <FaTrash/>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredItems.length === 0 && (
                <div className="text-center p-16 text-gray-500 flex flex-col items-center gap-4">
                    <FaBoxOpen size={40} className='text-gray-300'/>
                    <p className='font-bold'>No items found.</p>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LostFound;