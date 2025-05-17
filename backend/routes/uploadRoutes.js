const express = require('express');
const router = express.Router();
const multer = require('multer');
const XLSX = require('xlsx');
const fs = require('fs');
const Agent = require('../models/Agent');
const mongoose = require('mongoose');

// Model for uploaded list items
const itemSchema = new mongoose.Schema({
  firstName: String,
  phone: String,
  notes: String,
  agentId: mongoose.Schema.Types.ObjectId,
});
const Item = mongoose.model('Item', itemSchema);

// Setup Multer
const upload = multer({ dest: 'uploads/' });

// POST /api/upload
router.post('/', upload.single('file'), async (req, res) => {
  try {
    const workbook = XLSX.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    // Validate required fields
    const isValid = rows.every(row => row.FirstName && row.Phone && row.Notes);
    if (!isValid) return res.status(400).json({ msg: 'Invalid CSV format' });

    const agents = await Agent.find();
    if (agents.length === 0) return res.status(400).json({ msg: 'No agents found' });

    const itemsPerAgent = Math.floor(rows.length / agents.length);
    let extra = rows.length % agents.length;

    let distributed = [];
    let index = 0;

    for (let agent of agents) {
      let count = itemsPerAgent + (extra > 0 ? 1 : 0);
      extra--;

      const chunk = rows.slice(index, index + count).map(row => ({
        firstName: row.FirstName,
        phone: row.Phone,
        notes: row.Notes,
        agentId: agent._id,
      }));

      await Item.insertMany(chunk);
      distributed.push({ agent: agent.name, items: chunk.length });
      index += count;
    }

    fs.unlinkSync(req.file.path); // cleanup uploaded file
    res.json({ msg: 'List distributed', distributed });
  } catch (err) {
    res.status(500).json({ error: 'Upload failed', details: err.message });
  }
});


router.get('/distributed', async (req, res) => {
  try {
    const items = await Item.aggregate([
      {
        $lookup: {
          from: 'agents',
          localField: 'agentId',
          foreignField: '_id',
          as: 'agentInfo',
        },
      },
      { $unwind: '$agentInfo' },
      {
        $group: {
          _id: '$agentInfo.name',
          items: {
            $push: {
              firstName: '$firstName',
              phone: '$phone',
              notes: '$notes',
            },
          },
        },
      },
      {
        $project: {
          agentName: '$_id',
          items: 1,
          _id: 0
        }
      }
    ]);

    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch distributed data' });
  }
});


module.exports = router;
