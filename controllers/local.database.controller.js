const mongoose = require('mongoose');
const debug = require('debug')('app:loacalDatabaseController');
const articleSchema = require('../models/articleSchema');
const scrapingSchema = require('../models/scrapingSchema');
const Q = require('q');

mongoose.connect('mongodb://localhost:27017/web_crawler', {
    useNewUrlParser: true
}, function (err) {
    if (err) {
        debug(err);
    } else {
        debug('connected to the mongodb!');
    }
});


function getScrapingData(category){
    var deferred = Q.defer();
    var query = { precategory:category, categorize:false };
    articleSchema.find(query, function(err,docs){
        if (err) deferred.reject(err.name + ': ' + err.message);
        if(docs){
            debug('doc length:', docs.length);
            // deferred.resolve(docs);
        }else{
            deferred.resolve();
        }
    });
    return deferred.promise;
}

// getScrapingData('news');

function getScrapingPage(){
    var deferred = Q.defer();
    var query = { };
    scrapingSchema.find(query, function(err,docs){
        if (err) deferred.reject(err.name + ': ' + err.message);
        if(docs){
            debug('doc length:', docs);
            // deferred.resolve(docs);
        }else{
            deferred.resolve();
        }
    });
    return deferred.promise;
}

getScrapingPage();