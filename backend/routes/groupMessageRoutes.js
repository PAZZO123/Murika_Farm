const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/groupMessageController');
const auth    = require('../Middlewares/authMiddleware');

router.get('/',  auth, ctrl.getGroupMessages);
router.post('/', auth, ctrl.sendGroupMessage);

module.exports = router;
