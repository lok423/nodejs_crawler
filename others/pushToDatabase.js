const mongoose = require('mongoose');
const fs = require('fs');
const articleSchema = require('../models/articleSchema');
const debug = require('debug')('app:dataService')
// const Q = require('q');


mongoose.connect('mongodb://heroku_m353r10c:l59avnkgmk6ugd64k5i1roe7sr@ds121262.mlab.com:21262/heroku_m353r10c', {
    useNewUrlParser: true
}, function (err) {
    if (err) {
        dubug(err);
    } else {
        debug('connected to the mongodb!');
    }
});



function loadLocalJson() {
    const article_file = fs.readFileSync('./data/articles1.json', 'utf8');
    // console.log("is empty?", article_file);
    const article_content = JSON.parse(article_file);
    // var id = 0;
    for (var categoryNum = 0; categoryNum < article_content.length; categoryNum++) {
        for (var articleNum = 0; articleNum < article_content[categoryNum].length; articleNum++) {
            let doc = article_content[categoryNum][articleNum];
            let article = new articleSchema(doc);
            article.save()
                .then(doc => {
                    debug(doc)
                })
                .catch(err => {
                    debug(err)
                });
            // var category = article_content[categoryNum][articleNum].category;
            // article_content[categoryNum][articleNum].precategory = category;
            // delete article_content[categoryNum][articleNum].category;
        }
    }
    // const data = JSON.stringify(article_content);
    // fs.writeFileSync('./data/articles1.json', data);
    debug('finished processing');
}


function pushScrapingData(article){
    // var deferred = Q.defer();

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

module.exports.loadJson = loadLocalJson;
module.exports.pushScrapingData = pushScrapingData;