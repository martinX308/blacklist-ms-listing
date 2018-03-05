'use strict';

const express = require('express');
const router = express.Router();
const blacklist = require ('./api/blacklist');


router.use('/api/blacklist-entry', blacklist);


module.exports = router;
