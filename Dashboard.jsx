import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';

export function Dashboard() {
  const [childrenList, setChildrenList] = useState([]);

  useEffect(() => {
    async function getChildren() {
      // Select from CHILD and join PARENT to show parent name (per ERD: CHILD.Parent_ID → PARENT)
      const { data, error } = await supabase
        .from('CHILD')
        .select(`
          Child_ID,
          Name,
          Age,
          Medical_Notes,
          Parent_ID,
          PARENT (Name)
        `);

      if (error) {
        console.error('Error fetching children:', error.message);
      } else {
        setChildrenList(data || []);
      }
    }

    getChildren();
  }, []);

  return (
    <div className="dashboard-container">
      <h2 className="section-title">Registered Children</h2>
      <ul className="children-list">
        {childrenList.map((child) => (
          <li key={child.Child_ID}>
            <strong>{child.Name}</strong> — Age: {child.Age ?? '—'}
            {child.Medical_Notes && ` • Notes: ${child.Medical_Notes}`}
            {child.PARENT?.Name && ` • Parent: ${child.PARENT.Name}`}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Dashboard;