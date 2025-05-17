const express = require('express');
const bcrypt = require('bcryptjs');
const Agent = require('../models/Agent');
const upload = require('../middleware/upload');
const DistributedItem = require('../models/Distribute');
const csv = require('csv-parser');
const XLSX = require('xlsx');
const router = express.Router();

// Test route
router.get('/test', (req, res) => {
  res.send('✅ Admin route is working');
});

// Add new agent
router.post('/add-agent', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newAgent = new Agent({
      name,
      email,
      phone,
      password: hashedPassword
    });
    await newAgent.save();
    res.status(201).json({ message: 'Agent added successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add agent', details: err.message });
  }
});

// Get all agents
router.get('/agents', async (req, res) => {
  try {
    const agents = await Agent.find(); // removed role filter
    res.json(agents);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch agents' });
  }
});

// Update agent
router.put('/update-agent/:id', async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const agent = await Agent.findByIdAndUpdate(
      req.params.id,
      { name, email, phone },
      { new: true }
    );
    res.json(agent);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update agent' });
  }
});

// Delete agent
router.delete('/delete-agent/:id', async (req, res) => {
  try {
    await Agent.findByIdAndDelete(req.params.id);
    res.json({ message: 'Agent deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete agent' });
  }
});

// Upload and distribute leads
router.post('/upload-distribute', upload.single('file'), async (req, res) => {
  try {
    const buffer = req.file.buffer;
    const extension = req.file.originalname.split('.').pop();
    let records = [];

    if (extension === 'csv') {
      const stream = require('stream');
      const readable = new stream.Readable();
      readable.push(buffer);
      readable.push(null);

      const results = await new Promise((resolve, reject) => {
        const data = [];
        readable
          .pipe(csv())
          .on('data', (row) => data.push(row))
          .on('end', () => resolve(data))
          .on('error', reject);
      });
      records = results;
    } else {
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      records = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
    }

    if (!records.length) return res.status(400).json({ error: 'No records found' });

    const agents = await Agent.find();
    if (agents.length < 1) return res.status(400).json({ error: 'No agents found' });

    const distributed = [];
    for (let i = 0; i < records.length; i++) {
      const agentIndex = i % agents.length;
      distributed.push({
        firstName: records[i].FirstName,
        phone: records[i].Phone,
        notes: records[i].Notes || '',
        agentId: agents[agentIndex]._id
      });
    }

    await DistributedItem.insertMany(distributed);
    res.status(200).json({ message: 'Data distributed successfully', count: distributed.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to process file', details: err.message });
  }
});

// Get distributed data grouped by agent
router.get('/distributed', async (req, res) => {
  try {
    const items = await DistributedItem.find().populate('agentId');

    // Group items by agentId
    const grouped = {};

    items.forEach(item => {
      const agent = item.agentId;
      if (!agent || !agent._id) return;

      const agentId = agent._id.toString();
      if (!grouped[agentId]) {
        grouped[agentId] = {
          _id: agentId,
          agentName: agent.name || 'Unknown',
          items: []
        };
      }

      grouped[agentId].items.push({
        firstName: item.firstName,
        phone: item.phone,
        notes: item.notes || ''
      });
    });

    const response = Object.values(grouped);
    res.json(response);
  } catch (err) {
    console.error('Failed to fetch distributed data:', err);
    res.status(500).json({ error: 'Failed to fetch distributed data' });
  }
});

module.exports = router;
