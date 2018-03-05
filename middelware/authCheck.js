'use strict'; 
const axios = require("axios");

function authCheck (req, res, next) {
  if (!req.headers.authorization) {
    return res.status(403).json({ error: 'No credentials sent!' });
  } else {
  const auth = req.get("authorization");
  const credentials = new Buffer(auth.split(" ").pop(), "base64").toString("ascii").split(":");
  const identifier = {
    apiKey:credentials[0],
    apiSecret:credentials[1]
  };

  const options = {
    withCredentials: true
  };

  axios.post ('http://localhost:3000/api/customer-apps/verify',identifier,options) // cors
    .then(response => {
      console.log(response);
      return response.data; })
    .then(auth => {
     
      res.locals.application = auth.application._id;
      next(); 
    })
    .catch(error => {
      res.status(401).json({error: "authentication failed"});
    });

}}

module.exports = authCheck;
