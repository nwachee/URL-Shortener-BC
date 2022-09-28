const express = require('express');
const router = express.Router();

const {
	signup,
	login,
	protect,
	logout,
	
} = require('../controllers/users');


router.route('/login').post(login);
router.route('/signup').post(signup);
router.route('/logout').get(protect, logout);

module.exports = router;
