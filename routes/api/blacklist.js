'use strict';
const express    = require('express');
const router     = express.Router();
const authCheck = require ('../../middelware/authCheck');

const BlacklistEntry = require('../../models/blacklist-entry');
const RequestLog = require('../../models/request-log');

// create an blacklist entry with key and secret
router.post('/add', authCheck,(req,res,next) => { 
  const applicationNumber = res.locals.application;
  const ddNumber = req.body.ddNumber;


  const newEntry = BlacklistEntry ({
    application:applicationNumber,
    ddNumber
  });

  newEntry.save()
  .then(() => {
    console.log(newEntry);
    res.status(201).send("Dataset was processed successfully");
  });

})

//check against the blacklist
router.post('/check', authCheck,(req,res,next) => {
  const auth = req.get("authorization");
  const ddNumber = req.body.ddNumber;
  const credentials = new Buffer(auth.split(" ").pop(), "base64").toString("ascii").split(":");
  let match = false;

  BlacklistEntry.find({"ddNumber":ddNumber})
    .then((list) => {
      if(list.length > 0) {
        match = true;
        res.status(200).json({"match":match});
      } else {
        res.status(200).json({"match": match});
      }
  })
  .then( () => { // store response in RequestLog
    const newRequest = RequestLog({
      api:credentials[0],
      response:match
    });
    newRequest.save()
    .then(()=> 
    console.log (newRequest));
  });
})

router.get('/mylog',authCheck,(req,res,next) => {
  const auth = req.get("authorization");
  const credentials = new Buffer(auth.split(" ").pop(), "base64").toString("ascii").split(":");
  const apiKey = credentials[0];
  BlacklistEntry.find({"application":apiKey})
   .then(list => {
    let reqArray = list.map(dataset => dataset.toObject());
     return res.status(200).json({'blacklist':reqArray});
   })
   .catch( err =>{
     return res.status(200).json({'blacklist':[]});
   })
})


module.exports = router;