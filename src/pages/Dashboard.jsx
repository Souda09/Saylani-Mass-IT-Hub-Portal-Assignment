import React, { useState } from 'react';
import { useDashboard } from '../context/DashboardContext';
import Swal from 'sweetalert2';
import { FaCheckCircle, FaTimesCircle, FaClock, FaTrash, FaUserShield, FaInbox, FaSearch, FaPhoneAlt, FaEnvelope } from 'react-icons/fa';

const Dashboard = () => {
  const { 
    lostItems, 
    complaints, 
    volunteers, 
    loading, 
    updateStatus, 
    deleteRecord 
  } = useDashboard();
  
  const [activeTab, setActiveTab] = useState('complaints');

  // ACTION: Status Update (Approve/Reject)
  const handleStatusChange = (table, id, newStatus) => {
    Swal.fire({
      title: `Confirm ${newStatus}?`,
      text: `Are you sure you want to mark this as ${newStatus}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: `Yes, ${newStatus}!`,
      confirmButtonColor: newStatus === 'approved' ? '#10b981' : '#ef4444'
    }).then((res) => {
      if (res.isConfirmed) {
        updateStatus(table, id, newStatus);
      }
    });
  };

  // ACTION: Delete Record
  const handleDelete = (table, id) => {
    Swal.fire({
      title: 'Delete record?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      confirmButtonColor: '#ef4444'
    }).then((res) => { if(res.isConfirmed) deleteRecord(table, id) });
  };

  if (loading) return <div className="p-20 text-center font-bold text-blue-600 animate-pulse">Syncing Database...</div>;

  const tabs = [
    { id: 'complaints', label: 'Complaints', icon: FaInbox },
    { id: 'volunteers', label: 'Volunteers', icon: FaUserShield },
    { id: 'lostfound', label: 'Lost/Found', icon: FaSearch }
  ];

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 font-sans bg-slate-50 min-h-screen">
      <h1 className="text-4xl font-black text-slate-900 mb-8 tracking-tighter">
        Admin <span className="text-blue-600">Portal</span>
      </h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <StatCard label="Pending Complaints" val={complaints.filter(c => c.status === 'pending').length} color="border-orange-500" />
        <StatCard label="Registered Volunteers" val={volunteers.length} color="border-blue-500" />
        <StatCard label="Pending Lost/Found" val={lostItems.filter(l => l.status === 'pending').length} color="border-emerald-500" />
      </div>

      {/* Tab Switcher */}
      <div className="flex bg-white p-1 rounded-2xl shadow-sm mb-8 w-fit border border-slate-100">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} 
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all uppercase text-xs ${activeTab === tab.id ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>
              <Icon /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-slate-100">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
              <th className="p-5">Information</th>
              <th className="p-5">Submitted By</th>
              <th className="p-5 text-center">Status</th>
              <th className="p-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            
            {/* --- COMPLAINTS TABLE --- */}
            {activeTab === 'complaints' && complaints.map(c => (
              <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="p-5">
                  <p className="font-bold text-slate-800 text-sm">{c.issue_title || c.issue || 'No Title'}</p>
                  <p className="text-xs text-slate-500 mt-1">{c.description}</p>
                  <p className="text-[10px] text-slate-400 mt-2">{new Date(c.created_at).toLocaleString()}</p>
                </td>
                <td className="p-5">
                  <p className="font-bold text-slate-700 text-sm">{c.profiles?.full_name || 'N/A'}</p>
                  <p className="flex items-center gap-1.5 text-xs text-slate-500"><FaEnvelope size={10}/> {c.user_email}</p>
                  <p className="flex items-center gap-1.5 text-xs text-slate-500"><FaPhoneAlt size={10}/> {c.profiles?.phone || 'No Phone'}</p>
                </td>
                <td className="p-5 text-center">
                  <StatusBadge status={c.status} />
                </td>
                <td className="p-5 text-right space-x-2">
                  <button onClick={() => handleStatusChange('complaints', c.id, 'approved')} className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg hover:bg-emerald-100">APPROVE</button>
                  <button onClick={() => handleDelete('complaints', c.id)} className="text-xs font-bold text-red-500 hover:text-red-700"><FaTrash /></button>
                </td>
              </tr>
            ))}
            
            {/* --- VOLUNTEERS TABLE --- */}
            {activeTab === 'volunteers' && volunteers.map(v => (
              <tr key={v.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="p-5 flex items-center gap-4">
                  <img src={v.image_url} className="w-12 h-12 rounded-2xl object-cover border shadow-inner" alt="V" />
                  <div>
                    <p className="font-bold text-slate-800">{v.full_name}</p>
                    <p className="text-xs text-slate-500">{v.roll_no} | {v.event_name}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{v.hours}</p>
                  </div>
                </td>
                <td className="p-5">
                    <p className="text-xs text-slate-500">Joined: {new Date(v.created_at).toLocaleDateString()}</p>
                </td>
                <td className="p-5 text-center">
                  <StatusBadge status={v.status || 'approved'} />
                </td>
                <td className="p-5 text-right">
                  <button onClick={() => handleDelete('volunters', v.id)} className="text-xs font-bold text-red-500 hover:text-red-700"><FaTrash /></button>
                </td>
              </tr>
            ))}
            
            {/* --- LOST/FOUND TABLE --- */}
            {activeTab === 'lostfound' && lostItems.map(item => (
              <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="p-5">
                  <p className="font-bold text-slate-800 text-sm">{item.title}</p>
                  <p className="text-xs text-slate-500 mt-1">{item.description}</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${item.type === 'lost' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>{item.type.toUpperCase()}</span>
                </td>
                <td className="p-5">
                  <p className="font-bold text-slate-700 text-sm">{item.profiles?.full_name || 'N/A'}</p>
                  <p className="flex items-center gap-1.5 text-xs text-slate-500"><FaEnvelope size={10}/> {item.user_email}</p>
                  <p className="flex items-center gap-1.5 text-xs text-slate-500"><FaPhoneAlt size={10}/> {item.profiles?.phone || 'No Phone'}</p>
                </td>
                <td className="p-5 text-center">
                  <StatusBadge status={item.status} />
                </td>
                <td className="p-5 text-right space-x-2">
                  <button onClick={() => handleStatusChange('lost_found', item.id, 'approved')} className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg hover:bg-emerald-100">APPROVE</button>
                  <button onClick={() => handleDelete('lost_found', item.id)} className="text-xs font-bold text-red-500 hover:text-red-700"><FaTrash /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ label, val, color }) => (
  <div className={`bg-white p-6 rounded-3xl shadow-sm border-b-4 ${color}`}>
    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{label}</p>
    <p className="text-5xl font-black text-slate-900 tracking-tight">{val}</p>
  </div>
);

// Status Badge Component
const StatusBadge = ({ status }) => {
  const styles = {
    pending: "bg-orange-100 text-orange-700",
    approved: "bg-emerald-100 text-emerald-700",
    rejected: "bg-red-100 text-red-700",
  };
  const Icons = {
    pending: FaClock,
    approved: FaCheckCircle,
    rejected: FaTimesCircle,
  };
  const Icon = Icons[status] || FaClock;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${styles[status] || styles.pending}`}>
      <Icon /> {status || 'pending'}
    </span>
  );
};

export default Dashboard;