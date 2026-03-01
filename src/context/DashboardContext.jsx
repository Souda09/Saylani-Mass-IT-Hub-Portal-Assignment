import React, { createContext, useState, useEffect, useContext } from 'react';
import supabase from '../config'; 

const DashboardContext = createContext();

export const DashboardProvider = ({ children }) => {
  const [lostItems, setLostItems] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Data Fetching Function - Fetch ALL necessary fields + User Details
  const fetchAllData = async () => {
    setLoading(true);
    
    // Complaints: Joining profiles for full name and phone
    const { data: comp } = await supabase
      .from('complaints')
      .select('*, profiles(full_name, phone)') 
      .order('created_at', { ascending: false });
      
    // Volunteers: Fetching all fields
    const { data: vol } = await supabase
      .from('volunters')
      .select('*')
      .order('created_at', { ascending: false });
      
    // Lost/Found: Joining profiles for full name and phone
    const { data: lost } = await supabase
      .from('lost_found')
      .select('*, profiles(full_name, phone)') 
      .order('created_at', { ascending: false });
    
    setComplaints(comp || []);
    setVolunteers(vol || []);
    setLostItems(lost || []);
    setLoading(false);
  };

  // 2. ACTION: Update Status + Create Notification for User
  const updateStatus = async (table, id, newStatus) => {
    // A. Update the status in the main table
    const { error } = await supabase
      .from(table)
      .update({ status: newStatus })
      .eq('id', id);
    
    if (!error) {
      // B. Fetch data to refresh dashboard UI instantly
      fetchAllData();

      // C. GET RECORD DETAILS to know which user to notify
      const { data: record } = await supabase
        .from(table)
        .select('user_id')
        .eq('id', id)
        .single();

      // D. INSERT NOTIFICATION FOR THE USER
      if (record && record.user_id) {
        await supabase.from('notifications').insert({
          user_id: record.user_id, // Specific user
          message: `Your ${table} submission has been ${newStatus}.`,
          is_read: false
        });
      }
    }
  };

  // 3. ACTION: Delete Record
  const deleteRecord = async (table, id) => {
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (!error) fetchAllData();
  };

  // 4. REALTIME SETUP
  useEffect(() => {
    fetchAllData(); // Initial fetch

    const tables = ['lost_found', 'complaints', 'volunters'];
    
    // Subscribe to changes in all tables
    const channels = tables.map(table => 
      supabase.channel(`schema-db-changes-${table}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: table }, fetchAllData)
        .subscribe()
    );

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, []);

  return (
    <DashboardContext.Provider value={{ 
      lostItems, 
      complaints, 
      volunteers, 
      loading, 
      updateStatus, 
      deleteRecord 
    }}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => useContext(DashboardContext);