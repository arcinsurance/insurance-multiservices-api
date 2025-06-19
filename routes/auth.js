const express = require('express');
const router = express.Router();
const { sendOtp, verifyOtp, loginUser } = require('../controllers/authController');

router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/login', loginUser);

module.exports = router;
