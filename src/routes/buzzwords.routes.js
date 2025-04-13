const express = require('express');
const router = express.Router();
const controller = require('../controllers/buzzword.controller');


router.get('/daily', controller.getDailyBuzzwords);
router.get('/search', controller.searchBuzzwords);
router.post('/use', controller.submitUserSentence);
router.get('/:id/sentences', controller.getUserSentencesByTerm);
router.get('/all/user-sentences', controller.getAllUserSubmissions);


module.exports = router;
