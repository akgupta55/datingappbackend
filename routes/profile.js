const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getProfile, updateProfile, getAllProfiles, getMe } = require('../controllers/profileController');

router.get('/me', auth, getMe);
router.get('/', auth, getAllProfiles);
router.get('/:id', auth, getProfile);
router.put('/', auth, updateProfile);

module.exports = router;
