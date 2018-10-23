const mongoose = require('mongoose');
const fs = require('fs');
const debug = require('debug')('app:databaseController');
const Q = require('q');

const articleSchema = require('../models/articleSchema');
const scrapingSchema = require('../models/scrapingSchema');
const categorizedArticleSchema = require('../models/categorizedArticleSchema');



mongoose.connect('mongodb://heroku_m353r10c:l59avnkgmk6ugd64k5i1roe7sr@ds121262.mlab.com:21262/heroku_m353r10c', {
    useNewUrlParser: true
}, function (err) {
    if (err) {
        debug(err);
    } else {
        debug('connected to the mongodb!');
    }
});


function pushScrapingData(article) {
    let doc = new articleSchema(article);
    var query = articleSchema.findOne({
            title: article.title
        },
        function (err, article) {
            if (err) debug(err.name + ': ' + err.message);
            if (article) {
                // article has already existed
                debug('Article "' + article.title + '" is already exist');
            } else {
                doc.save()
                    .then(doc => {
                        debug("Success to push article ",doc.title)
                    })
                    .catch(err => {
                        debug(err)
                    });
            }
        });
}

function updateArticleModel() {
    articleSchema.find({}, {
            _id: 1
        })
        .exec((err, docs) => {
            if (err || docs == undefined || docs.length == 0)
            ;
            else {
                docs.forEach((doc) => {
                    articleSchema.findOneAndUpdate({
                            _id: doc._id
                        }, {
                            $set: {
                                categorize: false
                            }
                        })
                        .exec();
                });
            }
        });
}

function updateLastScrapingUrl(website,category,newUrl){
    var data = new scrapingSchema({website:website,category:category,last_visited_url:newUrl,update_at:Date.now()});
    var query = { website: website, category:category };
    scrapingSchema.findOne(query, function(err,doc){
        if (err) debug(err.name + ': ' + err.message);
        if(doc){
            if (doc.last_visited_url == newUrl){
                debug("No article update on ", category);
            }else{
                scrapingSchema.updateOne(doc,{last_visited_url:newUrl,update_at: Date.now()},function (err){
                    if (err) debug(err.name + ': ' + err.message);
                });
            }
        }
        else{
            data.save()
                .then(doc => {
                    debug("Success to update new url on ", category,"to ", newUrl)
                })
                .catch(err => {
                    debug(err)
                });
        }
    });
    }


function getLastScrapingUrl(website,category){
    var deferred = Q.defer();
    var query = { website: website, category:category };
    scrapingSchema.findOne(query, function(err,doc){
        if (err) deferred.reject(err.name + ': ' + err.message);
        if(doc){
            deferred.resolve(doc);
        }else{
            deferred.resolve();
        }
        
    });
    return deferred.promise;
}

function getScrapingData(category){
    var deferred = Q.defer();
    var query = { precategory:category };
    articleSchema.find(query, function(err,docs){
        if (err) deferred.reject(err.name + ': ' + err.message);
        if(docs){
            deferred.resolve(docs);
        }else{
            deferred.resolve();
        }
    });
    return deferred.promise;
}

function pushCategorizedData(article) {
    let doc = new categorizedArticleSchema(article);
    var query = categorizedArticleSchema.findOne({
            title: article.title 
        },
        function (err, article) {
            if (err) debug(err.name + ': ' + err.message);
            if (article) {
                // article has already existed
                debug('Article "' + article.title + '" is already exist');
            } else {
                doc.save()
                    .then(doc => {
                        debug("Success to push article ",doc.title)
                    })
                    .catch(err => {
                        debug(err)
                    });
            }
        });
}

function updateScrapingData(refId){
    var id = refId;
    articleSchema.findByIdAndUpdate(id, {categorize:true},function(err,res){
        if (err) debug(err.name + ': ' + err.message);
        if(res){
            debug("Update to the raw data has been edited");
        }else{
            debug("cannot find article");
        }
    })
    
}


module.exports.pushScrapingData = pushScrapingData;
module.exports.updateArticleModel = updateArticleModel;
module.exports.updateLastScrapingUrl = updateLastScrapingUrl;
module.exports.getLastScrapingUrl = getLastScrapingUrl;
module.exports.getScrapingData = getScrapingData;
module.exports.pushCategorizedData = pushCategorizedData;
module.exports.updateScrapingData = updateScrapingData;
