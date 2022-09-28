const express = require('express');
const router = express.Router();
const {
    redirectUrl
} = require('../controllers/urlShortener');

router.route('/:code').get(redirectUrl);

module.exports = router