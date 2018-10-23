const express = require('express');
const router = express.Router();
const debug = require('debug')('app:userEditcontroller');
const dataService = require('./database.controller');


router.post('/',processData);
router.get('/:category',getData);

function processData(req, res) {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString(); // convert Buffer to string
    });
    req.on('end', () => {
        debug("receive data");
        var data = JSON.parse(body);
        // debug(data.length);
        pushData(data);
        res.json('ok');
    });
    req.on('error', function(e) {
        // TODO: handle error.
        debug('-----error-------',e);
  });
}

function getData(req,res){
    const requestedCategory= req.params['category'].toLowerCase();
    debug(requestedCategory);
    var data = dataService.getScrapingData(requestedCategory)
        .then(function(x){
            // debug(x);
            res.json(x);
        });
}

function pushData(data){
    for(let i=0;i<data.length;i++){
            var article = data[i];
            var original_id = data[i]['refId'];
            dataService.pushCategorizedData(article);
            // dataService.updateScrapingData(original_id);

    }
}



module.exports = router;
