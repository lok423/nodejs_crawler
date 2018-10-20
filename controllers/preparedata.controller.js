const express = require('express');
const router = express.Router();
const debug = require('debug')('app:userEditcontroller');

router.post('/',processData);

function processData(req, res) {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString(); // convert Buffer to string
    });
    req.on('end', () => {
        debug(body);

        res.json('ok');
    });
    req.on('error', function(e) {
        // TODO: handle error.
        debug('-----error-------',e);
  });
}



module.exports = router;
