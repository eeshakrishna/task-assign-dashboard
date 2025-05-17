import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AddAgentForm = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '' });
  const [agents, setAgents] = useState([]);
  const [errors, setErrors] = useState({ email: '', phone: '' });

  const fetchAgents = async () => {
    const res = await axios.get('http://localhost:5000/api/admin/agents');
    setAgents(res.data);
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validatePhone = (phone) => {
    const regex = /^\d{10}$/;
    return regex.test(phone);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailValid = validateEmail(formData.email);
    const phoneValid = validatePhone(formData.phone);

    if (!emailValid || !phoneValid) {
      setErrors({
        email: emailValid ? '' : 'Invalid email format',
        phone: phoneValid ? '' : 'Phone number must be 10 digits',
      });
      return;
    }

    await axios.post('http://localhost:5000/api/admin/add-agent', formData);
    setFormData({ name: '', email: '', password: '', phone: '' });
    setErrors({ email: '', phone: '' });
    fetchAgents();
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });

    // Clear errors live
    if (field === 'email' && errors.email) {
      setErrors((prev) => ({ ...prev, email: validateEmail(value) ? '' : 'Invalid email format' }));
    }
    if (field === 'phone' && errors.phone) {
      setErrors((prev) => ({ ...prev, phone: validatePhone(value) ? '' : 'Phone number must be 10 digits' }));
    }
  };

  return (
    <div>
      <h2>Add Agent</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Name"
          value={formData.name}
          required
          onChange={(e) => handleChange('name', e.target.value)}
        />

        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          required
          onChange={(e) => handleChange('email', e.target.value)}
        />
        {errors.email && <p style={{ color: 'red' }}>{errors.email}</p>}

        <input
          type="text"
          placeholder="Phone"
          value={formData.phone}
          required
          onChange={(e) => handleChange('phone', e.target.value)}
        />
        {errors.phone && <p style={{ color: 'red' }}>{errors.phone}</p>}

        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          required
          onChange={(e) => handleChange('password', e.target.value)}
        />

        <button
          type="submit"
          disabled={
            !formData.name ||
            !formData.email ||
            !formData.phone ||
            !formData.password ||
            !!errors.email ||
            !!errors.phone
          }
        >
          Add Agent
        </button>
      </form>

      <h3>Agent List</h3>
      <ul>
        {agents.map((agent) => (
          <li key={agent._id}>
            {agent.name} ({agent.email}){' '}
            <button onClick={() => handleDelete(agent._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AddAgentForm;
