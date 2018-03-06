'use strict';

const express = require('express');
const router = express.Router();
const blacklist = require ('./api/blacklist');
const log = require ('./api/communication-log');


router.use('/api/blacklist-entry', blacklist);
router.use('/api/check-log', log);


module.exports = router;
