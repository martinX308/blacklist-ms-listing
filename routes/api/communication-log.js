'use strict';
const express    = require('express');
const router     = express.Router();
const authCheck = require ('../../middelware/authCheck');

const BlacklistEntry = require('../../models/blacklist-entry');
const RequestLog = require('../../models/request-log');



router.get('/',(req,res,next) => {
  const key= req.get("authtoken");
  let log = [];

  return RequestLog.find({"api":key},'created_at api response')
  .then((requests) => {
    if (requests.length > 0) {
        log.push(...requests);
    }
    res.status(200).json({"apiLog":log});
  });

})

module.exports = router;
  