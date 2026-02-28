import React, { useState } from 'react';
import { useDashboard } from '../context/DashboardContext';
import Swal from 'sweetalert2'; // npm install sweetalert2

const Dashboard = () => {
  const { lostItems, complaints, volunteers, loading, updateStatus, deleteRecord } = useDashboard();
  const [activeTab, setActiveTab] = useState('complaints');

  const handleDelete = (table, id) => {
    Swal.fire({
      title: 'Delete kar dein?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Haan, Delete!',
      confirmButtonColor: '#ef4444'
    }).then((res) => { if(res.isConfirmed) deleteRecord(table, id) });
  };

  if (loading) return <div className="p-20 text-center font-bold text-blue-600">Admin Data Syncing...</div>;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <h1 className="text-4xl font-black text-slate-800 mb-8 tracking-tighter">Admin <span className="text-blue-600 underline decoration-double">Portal</span></h1>

      {/* Modern Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <StatCard label="Complaints" val={complaints.length} color="border-orange-500" />
        <StatCard label="Volunteers" val={volunteers.length} color="border-blue-500" />
        <StatCard label="Active Posts" val={lostItems.length} color="border-emerald-500" />
      </div>

      {/* Unique Tab Switcher */}
      <div className="flex bg-white p-1 rounded-2xl shadow-sm mb-8 w-fit border">
        {['complaints', 'volunteers', 'posts'].map(t => (
          <button key={t} onClick={() => setActiveTab(t)} 
            className={`px-8 py-2 rounded-xl font-bold transition-all uppercase text-xs ${activeTab === t ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b">
            <tr className="text-slate-400 text-[10px] font-black uppercase">
              <th className="p-5">Details</th>
              <th className="p-5 text-center">Status</th>
              <th className="p-5 text-right">Control</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {activeTab === 'complaints' && complaints.map(c => (
              <tr key={c.id} className="hover:bg-slate-50/50">
                <td className="p-5">
                  <p className="font-bold text-slate-700">{c.issue}</p>
                  <p className="text-xs text-slate-400">{c.user_email}</p>
                </td>
                <td className="p-5 text-center">
                  <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase ${c.status === 'resolved' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                    {c.status || 'Pending'}
                  </span>
                </td>
                <td className="p-5 text-right space-x-3">
                  <button onClick={() => updateStatus('complaints', c.id, 'resolved')} className="text-[10px] font-bold text-blue-500 hover:underline">RESOLVE</button>
                  <button onClick={() => handleDelete('complaints', c.id)} className="text-[10px] font-bold text-red-400">DELETE</button>
                </td>
              </tr>
            ))}
            
            {activeTab === 'volunteers' && volunteers.map(v => (
              <tr key={v.id} className="hover:bg-slate-50">
                <td className="p-5 flex items-center gap-3">
                  <img src={v.image_url} className="w-10 h-10 rounded-full border shadow-sm" alt="V" />
                  <div><p className="font-bold">{v.full_name}</p><p className="text-xs text-slate-400">{v.roll_no}</p></div>
                </td>
                <td className="p-5 text-center font-bold text-blue-500 text-xs uppercase">Verified</td>
                <td className="p-5 text-right">
                  <button onClick={() => handleDelete('volunters', v.id)} className="text-[10px] font-bold text-red-400">REMOVE</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const StatCard = ({ label, val, color }) => (
  <div className={`bg-white p-6 rounded-3xl shadow-sm border-b-4 ${color}`}>
    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{label}</p>
    <p className="text-4xl font-black text-slate-800">{val}</p>
  </div>
);

export default Dashboard;