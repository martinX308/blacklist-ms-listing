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
    res.status(201).json({message:"Dataset was processed successfully"});
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

router.get('/mylog/:appId',authCheck,(req,res,next) => {
  const applicationId = req.params.appId;
  BlacklistEntry.find({"application": applicationId})
   .then(list => {
    let reqArray = list.map(dataset => dataset.toObject());
     return res.status(200).json({'blacklist':reqArray});
   })
   .catch( err =>{
     return res.status(200).json({'blacklist':[]});
   })
})

router.put('/mylog/:appId/edit',authCheck,(req,res,next) => {
  const applicationId = req.params.appId;
  const entryId = req.body.id;
  const ddNum = req.body.ddNum;

  BlacklistEntry.findById(entryId)
   .then(result => {
      if (result.toObject().application == applicationId) {

        result.ddNumber=ddNum;

        result.save()
          .then (()=> {
            return res.status(200).json({'newEntry':result.toObject()});
          });

      } else {
        return res.status(401).json({'error':'You are not authorized to modify this dataset'});
      }
   })
   .catch( err =>{
     return res.status(404).json({'error':'dataset could not found/modified'});
   })
})

module.exports = router;