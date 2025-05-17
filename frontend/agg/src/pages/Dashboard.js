import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/dashboard.css';

const Dashboard = () => {
  const [agents, setAgents] = useState([]);
  const [distributed, setDistributed] = useState([]);
  const [addForm, setAddForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [updateForm, setUpdateForm] = useState({ name: '', email: '', phone: '' });
  const [editAgentId, setEditAgentId] = useState(null);
  const [message, setMessage] = useState('');
  const [file, setFile] = useState(null);

  useEffect(() => {
    fetchAgents();
    fetchDistributedData();
  }, []);

  const fetchAgents = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/agents');
      setAgents(res.data);
    } catch (error) {
      console.error('Error fetching agents:', error);
    }
  };

  const fetchDistributedData = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/distributed');
      setDistributed(res.data);
    } catch (error) {
      console.error('Error fetching distributed data:', error);
    }
  };

  // ------------ Add Agent --------------
  const handleAddChange = (e) => {
    setAddForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      await axios.post('http://localhost:5000/api/admin/add-agent', addForm);
      setMessage('Agent added successfully!');
      setAddForm({ name: '', email: '', phone: '', password: '' });
      fetchAgents();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to add agent');
    }
  };

  // ------------ Update Agent --------------
  const handleUpdateChange = (e) => {
    setUpdateForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      await axios.put(`http://localhost:5000/api/admin/update-agent/${editAgentId}`, updateForm);
      setMessage('Agent updated successfully!');
      setEditAgentId(null);
      setUpdateForm({ name: '', email: '', phone: '' });
      fetchAgents();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to update agent');
    }
  };

  const handleEdit = (agent) => {
    setEditAgentId(agent._id);
    setUpdateForm({
      name: agent.name || '',
      email: agent.email || '',
      phone: agent.phone || '',
    });
    setMessage('');
  };

  const cancelEdit = () => {
    setEditAgentId(null);
    setUpdateForm({ name: '', email: '', phone: '' });
    setMessage('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this agent?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/admin/delete-agent/${id}`);
      setMessage('Agent deleted successfully!');
      fetchAgents();
    } catch (error) {
      setMessage('Failed to delete agent');
    }
  };

  // ------------ Upload & Distribute Leads --------------
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleFileUpload = async () => {
    if (!file) {
      alert('Please select a file first');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post('http://localhost:5000/api/admin/upload-distribute', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessage(res.data.message || 'File uploaded and leads distributed');
      fetchDistributedData();
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || 'File upload failed');
    }
  };


  return (
    <div className="dashboard-container">
      <h2>Admin Dashboard</h2>

      {/* Add Agent */}
      <div className="section">
        <h3>Add Agent</h3>
        <form onSubmit={handleAddSubmit}>
          <input name="name" placeholder="Name" value={addForm.name} onChange={handleAddChange} required />
          <input name="email" type="email" placeholder="Email" value={addForm.email} onChange={handleAddChange} required />
          <input name="phone" placeholder="Phone" value={addForm.phone} onChange={handleAddChange} required />
          <input name="password" type="password" placeholder="Password" value={addForm.password} onChange={handleAddChange} required />
          <button type="submit">Add Agent</button>
        </form>
      </div>

      {/* Update Agent */}
      {editAgentId && (
        <div className="section">
          <h3>Update Agent</h3>
          <form onSubmit={handleUpdateSubmit}>
            <input name="name" value={updateForm.name} onChange={handleUpdateChange} required />
            <input name="email" value={updateForm.email} onChange={handleUpdateChange} required disabled />
            <input name="phone" value={updateForm.phone} onChange={handleUpdateChange} required />
            <button type="submit">Update</button>{' '}
            <button type="button" onClick={cancelEdit}>Cancel</button>
          </form>
        </div>
      )}

      {message && <p className="message">{message}</p>}

      {/* Agents List */}
      <div className="section">
        <h3>Agents List</h3>
        {agents.length === 0 ? (
          <p>No agents found</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {agents.map(agent => (
                <tr key={agent._id}>
                  <td>{agent.name}</td>
                  <td>{agent.email}</td>
                  <td>{agent.phone}</td>
                  <td>
                    <button className="update-btn" onClick={() => handleEdit(agent)}>Update</button>
                    <button className="delete-btn" onClick={() => handleDelete(agent._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* File Upload */}
      <div className="section">
        <h3>Upload Leads CSV/XLSX</h3>
        <input type="file" accept=".csv, .xlsx, .xls" onChange={handleFileChange} />
        <button onClick={handleFileUpload}>Upload & Distribute</button>
      </div>

      {/* Distributed Leads */}
      <div className="section">
        <h3>Leads Assigned to Agents</h3>
        {distributed.length === 0 ? (
          <p>No distributed leads to show.</p>
        ) : (
          distributed.map(agent => (
            <div key={agent._id} style={{ marginBottom: 30 }}>
              <h4>Agent: {agent.agentName}</h4>
              <table>
                <thead>
                  <tr>
                    <th>First Name</th>
                    <th>Phone</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {agent.items.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.firstName}</td>
                      <td>{item.phone}</td>
                      <td>{item.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;
