const express = require('express');
const router = express.Router();
const {
    shortenUrl

} = require('../controllers/urlShortener');

const { protect } = require("../controllers/users")

router.route('/shorten').post(protect, shortenUrl);

module.exports = router