import React, { createContext, useState, useEffect, useContext } from 'react';
import supabase from '../config'; 

const DashboardContext = createContext();

export const DashboardProvider = ({ children }) => {
  const [lostItems, setLostItems] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Data Fetching Function
  const fetchAllData = async () => {
    setLoading(true);
    const { data: lost } = await supabase.from('lost_found').select('*').order('created_at', { ascending: false });
    const { data: comp } = await supabase.from('complaints').select('*').order('created_at', { ascending: false });
    const { data: vol } = await supabase.from('volunters').select('*').order('created_at', { ascending: false });
    
    setLostItems(lost || []);
    setComplaints(comp || []);
    setVolunteers(vol || []);
    setLoading(false);
  };

  // Actions
  const updateStatus = async (table, id, newStatus) => {
    const { error } = await supabase.from(table).update({ status: newStatus }).eq('id', id);
    if (!error) fetchAllData();
  };

  const deleteRecord = async (table, id) => {
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (!error) fetchAllData();
  };

  // Realtime
  useEffect(() => {
    fetchAllData();
    const channel = supabase
      .channel('db-changes')
      .on('postgres_changes', { event: '*', schema: 'public' }, () => fetchAllData())
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  return (
    <DashboardContext.Provider value={{ lostItems, complaints, volunteers, loading, updateStatus, deleteRecord }}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => useContext(DashboardContext);