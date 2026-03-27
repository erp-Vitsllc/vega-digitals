const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');

// PROFESSIONALLY ROUTED CONTACT POST REQUEST
router.post('/contact', contactController.sendInquiry);

module.exports = router;
