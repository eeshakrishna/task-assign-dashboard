const mongoose = require("mongoose");
const agentSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  password: String,
});
module.exports = mongoose.model("Agent", agentSchema);