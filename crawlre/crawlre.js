var request = require('request');
var cheerio = require('cheerio');
const {Article} = require('../models/article.model');
var URL = require('url-parse');
const util = require('util');
const EventEmitter = require('events');
const fs = require('fs');
const dataService = require('../controllers/database.controller');
const debug = require('debug')('app:crawlerService');



//Functions have not used yet
// function searchForWord($, word) {
//   var bodyText = $('html > body').text().toLowerCase();
//   return (bodyText.indexOf(word.toLowerCase()) !== -1);
// }
//
// function collectInternalLinks($) {
//   var relativeLinks = $("a[href^='/']");
//   relativeLinks.each(function() {
//     pagesToVisit.push(baseUrl + $(this).attr('href'));
//   });
// }


module.exports.execute = execute;

async function execute(_category, _url) {

  var category = _category;
  
  var url = _url;
  var pagesVisited = {};
  var numPagesVisited = 0;
  var pagesToVisit = [];
  var article_array = [];
  var no_more_article = false;
  //const MAX_PAGES_TO_VISIT = 10;
  var article_url_list = [];
  pagesToVisit.push(url);
  var last_page_url = await dataService.getLastScrapingUrl("educationcentral",category)
                        .then(function(last_page){
                          if(last_page){
                            debug("The ",category, " last page url is: ",last_page.last_visited_url);
                            return last_page.last_visited_url;
                          }
                        })


  async function crawl(pages) {
    if (pagesToVisit.length == 0) {
      console.log("no page to visit");
      return;

    }
    //Set Maximum pages to visit
    // if (numPagesVisited >= MAX_PAGES_TO_VISIT) {
    //   //console.log("Reached max limit of number of pages to visit.");
    //   return Promise.resolve(article_array);
    // }
    var nextPage = pagesToVisit.pop();
    if (nextPage in pagesVisited) {
      // We've already visited this page, so repeat the crawl
      crawl(pages);
    } else {
      // New page we haven't visited
      await makeRequest(nextPage).then(async function(data) {
        var result = await getUrlAndData(data, crawl);
      });
    }
    return await crawl(pages);
  }


  function makeRequest(url, _callback) {
    // Add page to our set
    pagesVisited[url] = true;
    numPagesVisited++;
    var callback = _callback;


    // Make the request
    return new Promise(function(resolve, reject) {
      console.log("Visiting page " + url);
      request(url, function(error, response, body) {
        // Check status code (200 is HTTP OK)
        console.log("Status code: " + response.statusCode);
        if (response.statusCode !== 200) {
          callback();
          reject(error);
        } else {
          resolve(body);
        }
      });
    });
  }


  function getUrlAndData(body, callback) {
    // Parse the document body
    var $ = cheerio.load(body);
    if (numPagesVisited == 1) {
      var highlight = $('.td_block_inner').first().children();
      highlight.find('a').each(function(i, item) {
        var href = $(this).attr('href');
        if(href == last_page_url){
          console.log('no new article');
          no_more_article = true;
          return false;
        }else{
          if (!(pagesToVisit.includes(href))) {
            pagesToVisit.push(href);
            article_url_list.push(href);
          }
        }
      });
      if(no_more_article==false){
        var main_content = $('.td-ss-main-content').children(".td_module_11").each(function(index){
          //console.log( index + ": " + $( this ).find('.td-module-thumb > a').attr('href') );
          var href = $( this ).find('.td-module-thumb > a').attr('href');
          if(href == last_page_url){
            console.log('no new article');
            no_more_article = true;
            return false;
          }else{
            pagesToVisit.push(href);
            article_url_list.push(href);
          }

        });
      }

      console.log("page to be visited: ",pagesToVisit);
      return 'finished';

    } else {
      var external_source = {name:null, href:null};
      //console.log(numPagesVisited);
      var article_content = [];
      $('.td-post-content p').each(function(i, item) {
        var p = $(this);
        if(p.html().includes('<em><strong>Source:')){

          external_source.name = p.text().substring(8,p.text().length);
          if(p.find( "a" ).html()!=null){
            //console.log(p.html());
            external_source.href = p.find( "a" ).attr('href');
          }
        }
        article_content.push(p.html());
      });

      var article_tags =[];
$('.td-post-source-tags').find('li').each(function( index ) {
  if(index >0){
    article_tags.push($( this ).text());
  }
});
      var article_title = $('.entry-title').first().text();
      var sub_title = $('.td-post-sub-title').text();
      var author_name = $('.td-post-author-name a').text();
      var article_date = $('.td-post-date').first().text();
      let article = new Article(category, article_title, sub_title, author_name, article_date, article_content, external_source,article_tags);
      //push article to article array
      article_array.push(article);
    }
    return new Promise(function(resolve, reject) {
      resolve('ok');
    });
  }


  var result = await crawl(pagesToVisit);
  console.log(category, article_url_list);
  if(article_url_list.length!=0){
    fs.readFile('./data/last_page.json', 'utf8', function readFileCallback(err, data){
      if (err){
          console.log(err);
      } else {
       obj = JSON.parse(data); //now it an object
       console.log(obj);
       if(obj[category].url != article_url_list[0]){
         console.log("category: ",category," old url: ",obj[category].url);
         console.log("category: ",category," updated url: ",article_url_list[0]);
         obj[category].url = article_url_list[0]; //add some data
         json = JSON.stringify(obj); //convert it back to json
        //  fs.writeFile('./data/last_page.json', json, 'utf8'); // write it back
         console.log("update url file");
       }else{
         console.log("no update url");
       }
  }});
    dataService.updateLastScrapingUrl("educationcentral", category, article_url_list[0]);

  }
  if(article_array.length==0){
    return false;
  }else{
    return article_array
  }

}
