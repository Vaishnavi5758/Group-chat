const express = require('express');
const messageController = require('../controllers/message');
const authMiddleware = require('../middleware/auth');

const router = express.Router();


router.post('/sendMessage', authMiddleware.authenticate, messageController.sendMessage);
router.get('/getMessage/:groupId', authMiddleware.authenticate, messageController.getMessage);
router.post('/uploadFile/:groupId', authMiddleware.authenticate, messageController.uploadFile);


module.exports = router;
