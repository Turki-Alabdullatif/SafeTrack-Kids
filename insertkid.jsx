import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';

function RegisterChild() {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [medicalNotes, setMedicalNotes] = useState('');
  const [parentId, setParentId] = useState('');
  const [parents, setParents] = useState([]);

  useEffect(() => {
    async function fetchParents() {
      const { data, error } = await supabase.from('PARENT').select('Parent_ID, Name');
      if (!error) setParents(data || []);
    }
    fetchParents();
  }, []);

  async function handleRegister(e) {
    e.preventDefault();
    if (!parentId) {
      alert('Please select a parent.');
      return;
    }

    const { error } = await supabase
      .from('CHILD')
      .insert([
        {
          Name: name,
          Age: age ? parseInt(age, 10) : null,
          Medical_Notes: medicalNotes || null,
          Parent_ID: parseInt(parentId, 10),
        },
      ]);

    if (error) {
      alert('Error adding child: ' + error.message);
    } else {
      alert('Child registered successfully!');
      setName('');
      setAge('');
      setMedicalNotes('');
      setParentId('');
    }
  }

  return (
    <div className="form-container">
      <h2 className="section-title">Register a Child</h2>
      <form className="form register-child-form" onSubmit={handleRegister}>
      <input
        type="text"
        placeholder="Child's Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="number"
        placeholder="Age"
        value={age}
        onChange={(e) => setAge(e.target.value)}
      />
      <textarea
        placeholder="Medical notes (optional)"
        value={medicalNotes}
        onChange={(e) => setMedicalNotes(e.target.value)}
      />
      <select
        value={parentId}
        onChange={(e) => setParentId(e.target.value)}
        placeholder="Select parent"
      >
        <option value="">Select parent</option>
        {parents.map((p) => (
          <option key={p.Parent_ID} value={p.Parent_ID}>
            {p.Name || `Parent #${p.Parent_ID}`}
          </option>
        ))}
      </select>
      <button type="submit" className="btn btn-primary">Register Child</button>
    </form>
    </div>
  );
}

export default RegisterChild;