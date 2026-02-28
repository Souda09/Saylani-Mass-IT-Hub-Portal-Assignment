import React, { useState, useEffect, useRef } from 'react';
import supabase from '../config'; // Apka Supabase connection
import Swal from 'sweetalert2';
import html2canvas from 'html2canvas';

const Volunter = () => {
  // --- STATES (Roman Urdu: Data store karne ke liye) ---
  const [volunterList, setVolunterList] = useState([]);
  const [isRegistered, setIsRegistered] = useState(false);
  const cardRef = useRef(null);

  const [formData, setFormData] = useState({
    fullName: '',
    rollNo: '',
    eventName: 'IT Convocation 2026',
    hours: '1 Hour',
    image: null,
    previewUrl: null 
  });

  const events = ["IT Convocation 2026", "Blood Donation Drive", "Job Fair", "Iftar Distribution"];
  const hourOptions = ["1 Hour", "2 Hours", "4 Hours", "Full Day Shift"];

  // --- DATA FETCHING (Roman Urdu: List mangwane ka function) ---
  useEffect(() => {
    fetchVolunterData();
  }, []);

  const fetchVolunterData = async () => {
    try {
      // Table name 'volunters' (single 'e') confirm kiya gaya hai
      const { data, error } = await supabase
        .from('volunters')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error) setVolunterList(data || []);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file, previewUrl: URL.createObjectURL(file) });
    }
  };

  // --- SUBMIT LOGIC (Roman Urdu: Registration aur Storage handling) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.image) return Swal.fire('Error', 'Please upload a profile photo', 'error');

    try {
      Swal.fire({ title: 'Processing...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

      let publicUrl = '';
      
      // Filename ko sanitize karna (Spaces khatam karna) taake Protocol Error na aaye
      const fileExt = formData.image.name.split('.').pop();
      const sanitizedFileName = `vol_${Date.now()}.${fileExt}`;

      // 1. Upload to Storage (Make sure 'portalImage' bucket is public)
      const { data: upData, error: upErr } = await supabase.storage
        .from('portalImage')
        .upload(sanitizedFileName, formData.image);

      if (upErr) throw upErr;

      // 2. Public URL hasil karna
      const { data: urlData } = supabase.storage.from('portalImage').getPublicUrl(sanitizedFileName);
      publicUrl = urlData.publicUrl;

      // 3. Database 'volunters' table mein insert karna
      const { error: insErr } = await supabase.from('volunters').insert([{
        full_name: formData.fullName,
        roll_no: formData.rollNo,
        event_name: formData.eventName,
        hours: formData.hours,
        image_url: publicUrl
      }]);

      if (insErr) throw insErr;

      Swal.fire('Success', 'Volunteer Registration Successful!', 'success');
      setIsRegistered(true); // Form se ID Card view par switch
      fetchVolunterData(); // Feed update karna
    } catch (err) {
      console.error("Process Error:", err);
      Swal.fire('Error', `Action failed: ${err.message}. Check your table 'volunters' and storage bucket.`, 'error');
    }
  };

  const downloadCard = () => {
    html2canvas(cardRef.current, { useCORS: true, scale: 3 }).then((canvas) => {
      const link = document.createElement('a');
      link.download = `Badge_${formData.rollNo}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    });
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-10 mt-5 font-sans">
      
      {/* HEADER: Saylani Theme colors */}
      <div className="bg-white p-8 rounded-[3rem] shadow-sm border-b-[10px] border-[#66b032] mb-12">
        <h1 className="text-3xl font-black text-[#0057a8]">SAYLANI <span className="text-[#66b032]">VOLUNTER</span></h1>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Official Registration Portal</p>
      </div>

      <div className="grid lg:grid-cols-12 gap-10">
        
        {/* LEFT: Registration Form or ID Badge Display */}
        <div className="lg:col-span-5 flex flex-col items-center">
          {!isRegistered ? (
            <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-gray-50 w-full">
              <h3 className="text-xl font-bold text-[#0057a8] mb-6 underline decoration-[#66b032]">Apply Now</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" placeholder="Full Name" required className="w-full p-4 rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-[#66b032] font-semibold text-sm" onChange={(e)=>setFormData({...formData, fullName: e.target.value})}/>
                <input type="text" placeholder="Roll Number (e.g. SMIT-1234)" required className="w-full p-4 rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-[#66b032] font-semibold text-sm" onChange={(e)=>setFormData({...formData, rollNo: e.target.value})}/>
                
                <div className="grid grid-cols-2 gap-3">
                  <select className="p-3 rounded-xl bg-gray-50 border-none font-bold text-xs text-[#0057a8]" onChange={(e)=>setFormData({...formData, eventName: e.target.value})}>
                    {events.map(ev => <option key={ev} value={ev}>{ev}</option>)}
                  </select>
                  <select className="p-3 rounded-xl bg-gray-50 border-none font-bold text-xs text-[#0057a8]" onChange={(e)=>setFormData({...formData, hours: e.target.value})}>
                    {hourOptions.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>

                <div className="border-2 border-dashed border-gray-200 p-6 rounded-2xl text-center relative hover:bg-green-50 transition-all cursor-pointer">
                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageChange} required/>
                  <p className="text-[10px] text-gray-400 font-black uppercase">{formData.image ? "Photo Attached ✅" : "Upload Passport Profile"}</p>
                </div>

                <button className="w-full bg-[#0057a8] text-white py-4 rounded-[2rem] font-black shadow-lg hover:bg-[#003d7a] transition-all uppercase tracking-widest">Register & View Badge</button>
              </form>
            </div>
          ) : (
            <div className="flex flex-col items-center animate-fade-in">
              {/* --- ID CARD DESIGN --- */}
              <div ref={cardRef} className="w-64 h-[380px] bg-white rounded-3xl shadow-2xl overflow-hidden border-t-[15px] border-[#0057a8] relative">
                <div className="p-8 text-center">
                  <div className="w-24 h-24 mx-auto rounded-full border-4 border-[#66b032] overflow-hidden mb-5 shadow-lg bg-gray-50">
                    <img src={formData.previewUrl} className="w-full h-full object-cover" alt="Volunteer" />
                  </div>
                  <h4 className="font-black text-lg text-[#0057a8] uppercase truncate tracking-tight leading-none">{formData.fullName}</h4>
                  <p className="text-[10px] font-bold text-[#66b032] tracking-widest mt-1">{formData.rollNo}</p>
                  
                  <div className="mt-8 bg-gray-50 p-4 rounded-2xl text-center">
                    <p className="text-[7px] text-gray-400 font-black uppercase">Assignment</p>
                    <p className="text-[9px] font-black text-gray-700 uppercase mt-1">{formData.eventName}</p>
                  </div>
                </div>
                <div className="absolute bottom-0 w-full bg-[#0057a8] py-3 text-center text-white text-[7px] font-bold tracking-[0.5em]">OFFICIAL MEMBER</div>
              </div>

              {/* Chota Professional Button */}
              <button 
                onClick={downloadCard} 
                className="mt-8 bg-[#66b032] text-white px-8 py-2 rounded-full font-black text-xs shadow-xl hover:bg-[#0057a8] transition-all uppercase tracking-widest"
              >
                📥 Download Badge
              </button>
              <button onClick={() => setIsRegistered(false)} className="mt-4 text-[9px] font-black text-gray-400 underline">Add New Member</button>
            </div>
          )}
        </div>

        {/* RIGHT: RECENT ACTIVITY FEED */}
        <div className="lg:col-span-7">
           <h3 className="text-xs font-black text-gray-400 uppercase mb-8 tracking-[0.4em] flex items-center gap-2">
             <span className="w-8 h-[2px] bg-[#66b032]"></span>
             Live Member Feed
           </h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
             {volunterList.slice(0, 6).map(v => (
               <div key={v.id} className="bg-white p-4 rounded-[2rem] flex items-center gap-4 shadow-sm border border-gray-50 hover:shadow-md transition-all">
                 <img src={v.image_url} className="w-12 h-12 rounded-xl object-cover border shadow-sm" />
                 <div>
                   <h5 className="font-black text-sm text-[#0057a8] uppercase truncate w-32">{v.full_name}</h5>
                   <p className="text-[9px] text-gray-400 font-bold uppercase italic mt-1">{v.event_name}</p>
                 </div>
               </div>
             ))}
           </div>
        </div>

      </div>
    </div>
  );
};

export default Volunter;