const router = require('express').Router();
const { sendOtp, validateOtp, googleAuth, googleCallback } = require('../controllers/Auth');

router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);
router.post('/send-otp', sendOtp);
router.post('/validate-otp', validateOtp);

module.exports = router;