const mongoose = require('mongoose');
const fs = require('fs');
const articleSchema = require('../models/articleSchema');
const debug = require('debug')('app:databaseController');


mongoose.connect('mongodb://heroku_m353r10c:l59avnkgmk6ugd64k5i1roe7sr@ds121262.mlab.com:21262/heroku_m353r10c', {
    useNewUrlParser: true
}, function (err) {
    if (err) {
        dubug(err);
    } else {
        debug('connected to the mongodb!');
    }
});


function pushScrapingData(article){
    let doc = new articleSchema(article);
    var query = articleSchema.findOne({title:article.title},
        function (err, article) {
            if (err) deferred.reject(err.name + ': ' + err.message);
            if (article) {
                // article has already existed
                debug('Article "' + article.title + '" is already exist');
            } else {
                doc.save()
                .then(doc => {
                    debug(doc)
                })
                .catch(err => {
                    debug(err)
                });
            }
        });
}

module.exports.pushScrapingData = pushScrapingData;