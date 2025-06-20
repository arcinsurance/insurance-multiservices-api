
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const agentSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: 'agent' },
  status: { type: String, default: 'active' }
});

const Agent = mongoose.models.Agent || mongoose.model('Agent', agentSchema);

router.post('/', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    const existing = await Agent.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'Agent with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAgent = new Agent({ name, email, password: hashedPassword });
    await newAgent.save();

    res.status(201).json({ message: 'Agent created successfully' });
  } catch (error) {
    console.error('Error registering agent:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
