const mongoose = require('mongoose');

const distributedItemSchema = new mongoose.Schema({
  firstName: String,
  phone: String,
  notes: String,
  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent'
  }
});

module.exports = mongoose.model('DistributedItem', distributedItemSchema);
