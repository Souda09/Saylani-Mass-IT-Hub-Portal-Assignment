import React, { useState, useEffect, useRef } from 'react';
import supabase from '../config';
import Swal from 'sweetalert2';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const Volunter = () => {
  // --- STATES ---
  const [userVolunter, setUserVolunter] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
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

  // --- DATA FETCHING ---
  useEffect(() => {
    checkUserAndFetch();
  }, []);

  const checkUserAndFetch = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setCurrentUser(user);
      fetchUserRegistration(user.id);
    }
  };

  const fetchUserRegistration = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('volunters')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (!error && data) {
        setUserVolunter(data);
        setIsRegistered(true);
      }
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

  // --- SUBMIT LOGIC ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.image || !currentUser) {
      return Swal.fire('Error', 'Please log in to apply', 'error');
    }

    try {
      Swal.fire({ 
        title: 'Processing...', 
        allowOutsideClick: false, 
        didOpen: () => Swal.showLoading() 
      });

      let publicUrl = '';
      const fileExt = formData.image.name.split('.').pop();
      const sanitizedFileName = `vol_${Date.now()}.${fileExt}`;

      // 1. Upload to Storage
      const { error: upErr } = await supabase.storage
        .from('portalImage')
        .upload(sanitizedFileName, formData.image);

      if (upErr) throw upErr;

      // 2. Get Public URL
      const { data: urlData } = supabase.storage.from('portalImage').getPublicUrl(sanitizedFileName);
      publicUrl = urlData.publicUrl;

      // 3. Insert into Database
      const { error: insErr } = await supabase.from('volunters').insert([{
        full_name: formData.fullName,
        roll_no: formData.rollNo,
        event_name: formData.eventName,
        hours: formData.hours,
        image_url: publicUrl,
        user_id: currentUser.id
      }]);

      if (insErr) throw insErr;

      Swal.fire('Success', 'Registered Successfully!', 'success');
      fetchUserRegistration(currentUser.id);
    } catch (err) {
      console.error("Process Error:", err);
      Swal.fire('Error', `Action failed: ${err.message}`, 'error');
    }
  };

  // --- FIXED PDF DOWNLOAD FUNCTION ---
  const downloadPDF = async () => {
    try {
      Swal.fire({
        title: 'Generating PDF...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });

      const { full_name, roll_no, event_name, image_url } = userVolunter;
      
      // Method 1: Create a simple styled card with inline styles
      const pdfCard = document.createElement('div');
      
      pdfCard.innerHTML = `
        <div style="width: 256px; height: 380px; background: white; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border-top: 15px solid #0057a8; position: relative; font-family: Arial, Helvetica, sans-serif;">
          <div style="padding: 32px 16px; text-align: center;">
            <div style="width: 96px; height: 96px; margin: 0 auto 16px; border-radius: 50%; border: 4px solid #66b032; overflow: hidden; background: #f3f4f6;">
              <img src="${image_url}" style="width: 100%; height: 100%; object-fit: cover;" crossorigin="anonymous" />
            </div>
            <h4 style="font-size: 18px; font-weight: 900; color: #0057a8; text-transform: uppercase; margin: 8px 0 4px; line-height: 1.2; word-wrap: break-word;">${full_name}</h4>
            <p style="font-size: 10px; font-weight: bold; color: #66b032; letter-spacing: 1px; margin: 0 0 16px;">${roll_no}</p>
            
            <div style="margin-top: 32px; background: #f3f4f6; padding: 16px; border-radius: 16px;">
              <p style="font-size: 7px; color: #6b7280; font-weight: 900; text-transform: uppercase; margin: 0 0 4px;">Assignment</p>
              <p style="font-size: 9px; font-weight: 900; color: #1f2937; text-transform: uppercase; margin: 0;">${event_name}</p>
            </div>
          </div>
          <div style="position: absolute; bottom: 0; left: 0; right: 0; background: #0057a8; padding: 12px 0; text-align: center;">
            <span style="color: white; font-size: 7px; font-weight: bold; letter-spacing: 4px;">OFFICIAL MEMBER</span>
          </div>
        </div>
      `;
      
      // Hide the card temporarily
      pdfCard.style.position = 'absolute';
      pdfCard.style.left = '-9999px';
      pdfCard.style.top = '0';
      document.body.appendChild(pdfCard);

      // Wait for image to load
      const img = pdfCard.querySelector('img');
      if (img && !img.complete) {
        await new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
        });
      }

      // Convert to canvas with simple settings
      const canvas = await html2canvas(pdfCard, {
        scale: 2,
        backgroundColor: '#ffffff',
        allowTaint: true,
        useCORS: true,
        logging: false,
        windowWidth: 256,
        windowHeight: 380
      });

      // Remove temporary element
      document.body.removeChild(pdfCard);

      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a6'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
      pdf.save(`Volunteer_Badge_${roll_no}.pdf`);
      
      Swal.close();
      Swal.fire('Success', 'PDF downloaded successfully!', 'success');
      
    } catch (error) {
      console.error("PDF Generation Error:", error);
      
      // Method 2: Fallback - Text-only PDF
      try {
        Swal.fire({
          title: 'Using fallback method...',
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading()
        });
        
        const { full_name, roll_no, event_name } = userVolunter;
        
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a6'
        });
        
        // Add border
        pdf.setDrawColor(0, 87, 168);
        pdf.setLineWidth(2);
        pdf.rect(5, 5, 95, 138);
        
        // Add top bar
        pdf.setFillColor(0, 87, 168);
        pdf.rect(5, 5, 95, 10, 'F');
        
        // Title
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.text('SAYLANI VOLUNTER', 52, 12, { align: 'center' });
        
        // Content
        pdf.setTextColor(0, 87, 168);
        pdf.setFontSize(14);
        pdf.text('VOLUNTEER CARD', 52, 30, { align: 'center' });
        
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(12);
        pdf.text(`Name: ${full_name}`, 15, 50);
        pdf.text(`Roll No: ${roll_no}`, 15, 65);
        pdf.text(`Event: ${event_name}`, 15, 80);
        
        // Bottom bar
        pdf.setFillColor(102, 176, 50);
        pdf.rect(5, 130, 95, 13, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(8);
        pdf.text('OFFICIAL MEMBER', 52, 138, { align: 'center' });
        
        pdf.save(`Volunteer_Badge_${roll_no}.pdf`);
        
        Swal.close();
        Swal.fire('Success', 'PDF downloaded successfully!', 'success');
        
      } catch (fallbackError) {
        console.error("Fallback Error:", fallbackError);
        Swal.fire('Error', 'PDF generation failed. Please try again.', 'error');
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-10 mt-5 font-sans">
      
      {/* HEADER */}
      <div className="bg-white p-8 rounded-[3rem] shadow-sm border-b-[10px] border-[#66b032] mb-12">
        <h1 className="text-3xl font-black text-[#0057a8]">SAYLANI <span className="text-[#66b032]">VOLUNTER</span></h1>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Official Registration Portal</p>
      </div>

      <div className="flex justify-center">
        
        {/* FORM/CARD SECTION */}
        <div className="w-full md:w-2/3 lg:w-1/2 flex flex-col items-center">
          {!isRegistered ? (
            <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-gray-50 w-full">
              <h3 className="text-xl font-bold text-[#0057a8] mb-6 underline decoration-[#66b032]">Apply Now</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input 
                  type="text" 
                  placeholder="Full Name" 
                  required 
                  className="w-full p-4 rounded-xl bg-gray-50 border outline-none font-semibold text-sm" 
                  onChange={(e)=>setFormData({...formData, fullName: e.target.value})}
                  value={formData.fullName}
                />
                <input 
                  type="text" 
                  placeholder="Roll Number (e.g. SMIT-1234)" 
                  required 
                  className="w-full p-4 rounded-xl bg-gray-50 border outline-none font-semibold text-sm" 
                  onChange={(e)=>setFormData({...formData, rollNo: e.target.value})}
                  value={formData.rollNo}
                />
                
                <div className="grid grid-cols-2 gap-3">
                  <select 
                    className="p-3 rounded-xl bg-gray-50 border font-bold text-xs text-[#0057a8]" 
                    onChange={(e)=>setFormData({...formData, eventName: e.target.value})}
                    value={formData.eventName}
                  >
                    {events.map(ev => <option key={ev} value={ev}>{ev}</option>)}
                  </select>
                  <select 
                    className="p-3 rounded-xl bg-gray-50 border font-bold text-xs text-[#0057a8]" 
                    onChange={(e)=>setFormData({...formData, hours: e.target.value})}
                    value={formData.hours}
                  >
                    {hourOptions.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>

                <div className="border-2 border-dashed border-gray-200 p-6 rounded-2xl text-center relative hover:bg-green-50 transition-all cursor-pointer">
                  <input 
                    type="file" 
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                    onChange={handleImageChange} 
                    accept="image/*"
                    required
                  />
                  <p className="text-[10px] text-gray-400 font-black uppercase">
                    {formData.image ? "Photo Attached ✅" : "Upload Profile Photo"}
                  </p>
                  {formData.previewUrl && (
                    <img src={formData.previewUrl} alt="Preview" className="w-16 h-16 mx-auto mt-2 rounded-full object-cover" />
                  )}
                </div>

                <button 
                  type="submit"
                  className="w-full bg-[#0057a8] text-white py-4 rounded-[2rem] font-black shadow-lg hover:bg-[#003d7a] transition-all uppercase tracking-widest"
                >
                  Register
                </button>
              </form>
            </div>
          ) : userVolunter && (
            <div className="flex flex-col items-center animate-fade-in">
              {/* --- ID CARD DESIGN --- */}
              <div 
                ref={cardRef} 
                className="w-64 h-[380px] bg-white rounded-3xl shadow-2xl overflow-hidden border-t-[15px] border-[#0057a8] relative"
              >
                <div className="p-8 text-center">
                  <div className="w-24 h-24 mx-auto rounded-full border-4 border-[#66b032] overflow-hidden mb-5 shadow-lg bg-gray-50">
                    <img 
                      src={userVolunter.image_url} 
                      className="w-full h-full object-cover" 
                      alt="Volunteer"
                      crossOrigin="anonymous"
                    />
                  </div>
                  <h4 className="font-black text-lg text-[#0057a8] uppercase truncate leading-none">
                    {userVolunter.full_name}
                  </h4>
                  <p className="text-[10px] font-bold text-[#66b032] tracking-widest mt-1">
                    {userVolunter.roll_no}
                  </p>
                  
                  <div className="mt-8 bg-gray-50 p-4 rounded-2xl text-center">
                    <p className="text-[7px] text-gray-400 font-black uppercase">Assignment</p>
                    <p className="text-[9px] font-black text-gray-700 uppercase mt-1">
                      {userVolunter.event_name}
                    </p>
                  </div>
                </div>
                <div className="absolute bottom-0 w-full bg-[#0057a8] py-3 text-center text-white text-[7px] font-bold tracking-[0.5em]">
                  OFFICIAL MEMBER
                </div>
              </div>

              {/* PDF Download Button */}
              <button 
                onClick={downloadPDF} 
                className="mt-8 bg-[#66b032] text-white px-8 py-2 rounded-full font-black text-xs shadow-xl hover:bg-[#0057a8] transition-all uppercase tracking-widest flex items-center gap-2"
              >
                <span>📥</span> Download PDF
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add print styles */}
      <style jsx>{`
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Volunter;