
const express = require('express');
const router = express.Router();
const filtersController = require('../controllers/filtersController');

router.get('/', filtersController.getAllFilters);

module.exports = router;
