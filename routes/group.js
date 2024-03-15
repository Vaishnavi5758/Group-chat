const express = require('express');
const groupController = require('../controllers/group');
const authMiddleware = require('../middleware/auth');

const router = express.Router();


router.post('/createGroup', authMiddleware.authenticate, groupController.createGroup);
router.get('/fetchGroup/:id', authMiddleware.authenticate, groupController.fetchGroups);
router.post('/addMember', authMiddleware.authenticate, groupController.addMember);
router.get('/fetchGroupUsers/:id', authMiddleware.authenticate, groupController.fetchGroupUsers);
router.delete('/deleteGroup/:activeGroupId', authMiddleware.authenticate, groupController.deleteGroup);
router.delete('/exitGroup/:activeGroupId/:userId', authMiddleware.authenticate, groupController.exitGroup);
router.post('/makeAdmin/:activeGroupId/:userId', authMiddleware.authenticate, groupController.makeAdmin);
router.delete('/deleteMember/:activeGroupId/:userId', authMiddleware.authenticate, groupController.deleteMember);



module.exports = router;
