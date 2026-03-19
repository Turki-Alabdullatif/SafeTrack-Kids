import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabase';
import Header from './Header';
import Footer from './Footer';
import { useAuth } from './AuthContext';

function EditBracelets() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [bracelets, setBracelets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingId, setUpdatingId] = useState(null); 

  useEffect(() => {
    if (!user) {
      navigate('/loginCard');
      return;
    }
    fetchBracelets();
  }, [user, navigate]);

  async function fetchBracelets() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('bracelet')
        .select('*')
        .order('mac_address', { ascending: true });

      if (error) throw error;
      setBracelets(data || []);
    } catch (err) {
      console.error("Error fetching bracelets:", err);
      alert("Could not load inventory: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(braceletId, newStatus) {
    setUpdatingId(braceletId);
    try {
      const targetBracelet = bracelets.find(b => b.Bracelet_id === braceletId || b.bracelet_id === braceletId || b.id === braceletId);
      const exactIdColumn = targetBracelet.Bracelet_id ? 'Bracelet_id' : (targetBracelet.bracelet_id ? 'bracelet_id' : 'id');

      const { error } = await supabase
        .from('bracelet')
        .update({ status: newStatus })
        .eq(exactIdColumn, braceletId);

      if (error) throw error;

      setBracelets(bracelets.map(b => 
        (b[exactIdColumn] === braceletId) ? { ...b, status: newStatus } : b
      ));

    } catch (err) {
      alert("Failed to update status: " + err.message);
    } finally {
      setUpdatingId(null);
    }
  }

  // --- NEW: RECHARGE BATTERY FEATURE ---
  async function handleRecharge(braceletId) {
    setUpdatingId(braceletId);
    try {
      const targetBracelet = bracelets.find(b => b.Bracelet_id === braceletId || b.bracelet_id === braceletId || b.id === braceletId);
      const exactIdColumn = targetBracelet.Bracelet_id ? 'Bracelet_id' : (targetBracelet.bracelet_id ? 'bracelet_id' : 'id');

      const { error } = await supabase
        .from('bracelet')
        .update({ battery_level: 100 })
        .eq(exactIdColumn, braceletId);

      if (error) throw error;

      setBracelets(bracelets.map(b => 
        (b[exactIdColumn] === braceletId) ? { ...b, battery_level: 100 } : b
      ));
      
      alert("Hardware successfully recharged to 100%!");

    } catch (err) {
      alert("Failed to recharge hardware: " + err.message);
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleDelete(braceletId) {
    const confirmDelete = window.confirm("Are you sure you want to permanently delete this hardware from the system?");
    if (!confirmDelete) return;

    setUpdatingId(braceletId);
    try {
      const targetBracelet = bracelets.find(b => b.Bracelet_id === braceletId || b.bracelet_id === braceletId || b.id === braceletId);
      const exactIdColumn = targetBracelet.Bracelet_id ? 'Bracelet_id' : (targetBracelet.bracelet_id ? 'bracelet_id' : 'id');

      const { error } = await supabase
        .from('bracelet')
        .delete()
        .eq(exactIdColumn, braceletId);

      if (error) throw error;

      setBracelets(bracelets.filter(b => b[exactIdColumn] !== braceletId));

    } catch (err) {
      alert("Failed to delete hardware. It might be linked to an active session! Error: " + err.message);
    } finally {
      setUpdatingId(null);
    }
  }

  const filteredBracelets = bracelets.filter(b => 
    b.mac_address?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    b.qr_code_string?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="page-layout-wrapper" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#fafcfd' }}>
      <Header />
      
      <main style={{ flex: 1, padding: '30px 20px', display: 'flex', flexDirection: 'column', maxWidth: '1000px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            <h2 className="page-title" style={{ fontSize: '1.8rem', margin: '0 0 5px 0' }}>Hardware Inventory</h2>
            <p className="page-subtitle" style={{ margin: 0, color: '#64748b' }}>Manage, update, and recharge system bracelets.</p>
          </div>
          <button 
            onClick={() => navigate('/organizerDashboard')} 
            style={{ padding: '8px 16px', backgroundColor: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#334155', fontWeight: '600', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
          >
            ← Back to Dashboard
          </button>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <input 
            type="text" 
            placeholder="🔍 Search by MAC Address or QR Code..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '12px 15px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '1rem', boxSizing: 'border-box', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}
          />
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>⏳ Loading inventory...</div>
        ) : filteredBracelets.length === 0 ? (
          <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '40px', textAlign: 'center', border: '1px dashed #cbd5e1' }}>
            <span style={{ fontSize: '2rem' }}>📦</span>
            <h3 style={{ margin: '10px 0', color: '#0f172a' }}>No Hardware Found</h3>
            <p style={{ color: '#64748b', margin: '0 0 20px 0' }}>No bracelets match your search, or the inventory is empty.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '15px' }}>
            {filteredBracelets.map(b => {
              const bId = b.Bracelet_id || b.bracelet_id || b.id;
              const isUpdating = updatingId === bId;

              return (
                <div key={bId} style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', opacity: isUpdating ? 0.6 : 1 }}>
                  
                  <div style={{ flex: '1 1 250px' }}>
                    <h4 style={{ margin: '0 0 5px 0', color: '#0f172a', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      ⌚ {b.mac_address}
                      <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '999px', backgroundColor: b.battery_level < 20 ? '#fef2f2' : '#f0fdf4', color: b.battery_level < 20 ? '#dc2626' : '#16a34a', fontWeight: 'bold' }}>
                        🔋 {b.battery_level}%
                      </span>
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>QR: {b.qr_code_string || 'N/A'}</p>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    
                    {/* NEW RECHARGE BUTTON */}
                    <button 
                      onClick={() => handleRecharge(bId)}
                      disabled={isUpdating || b.battery_level === 100}
                      style={{ padding: '8px 12px', backgroundColor: b.battery_level === 100 ? '#f1f5f9' : '#e0f2fe', border: '1px solid', borderColor: b.battery_level === 100 ? '#e2e8f0' : '#bae6fd', borderRadius: '6px', color: b.battery_level === 100 ? '#94a3b8' : '#0284c7', fontWeight: '600', cursor: b.battery_level === 100 ? 'default' : 'pointer', fontSize: '0.85rem' }}
                    >
                      ⚡ Recharge
                    </button>

                    <select 
                      value={b.status} 
                      onChange={(e) => handleStatusChange(bId, e.target.value)}
                      disabled={isUpdating}
                      style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', fontSize: '0.85rem', fontWeight: '600', color: b.status === 'Available' ? '#16a34a' : (b.status === 'Maintenance' ? '#ca8a04' : '#2563eb'), cursor: 'pointer' }}
                    >
                      <option value="Available">Available</option>
                      <option value="Assigned">Assigned</option>
                      <option value="Maintenance">Maintenance</option>
                    </select>

                    <button 
                      onClick={() => handleDelete(bId)}
                      disabled={isUpdating}
                      style={{ padding: '8px 12px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', color: '#dc2626', fontWeight: '600', cursor: 'pointer', fontSize: '0.85rem' }}
                    >
                      Delete
                    </button>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default EditBracelets;