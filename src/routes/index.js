const express = require('express');
const router = express.Router();

const buzzwordsRoutes = require('./buzzwords.routes');
router.use('/terms', buzzwordsRoutes);

module.exports = router;
