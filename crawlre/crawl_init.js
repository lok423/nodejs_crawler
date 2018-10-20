const fs = require('fs');
const {
  PythonShell
} = require('python-shell');
const schedule = require('node-schedule');
const Crawlre = require('./crawlre.js');
const dataService = require('../controllers/database.controller');
const options = {
  mode: 'text',
  encoding: 'utf-8',
  pythonOptions: ['-u'],
  scriptPath: './',
  args: ['hello world'],
  pythonPath: '/usr/bin/python',
};


function crawlinit() {
  console.time('read file');
  const file = fs.readFileSync('./data/last_page.json', 'utf8');
  var idInit=0;
  // var article_file = fs.readFileSync('last_page.json', 'utf8');
  // var content =  JSON.parse(article_file);
  // var article_content=null;
  fs.readFile('./data/articles.json', (err, data) => {
    article_content = JSON.parse(data);
    let total = article_content.length;
    // console.log(total);
    idInit = total;
    console.log("start id",idInit);

  });
  console.timeEnd('read file');


  const News_URL = 'https://educationcentral.co.nz/category/news/';
  const Features_URL = 'https://educationcentral.co.nz/category/features/';
  const Opinion_URL = 'https://educationcentral.co.nz/category/opinion/';
  const Teaching_And_Learning_URL = 'https://educationcentral.co.nz/category/teaching-and-learning/';
  const Sectors_URL = 'https://educationcentral.co.nz/category/sectors/';
  const Future_URL = 'https://educationcentral.co.nz/category/future-focus/';

  function scheduleCronstyle() {
    schedule.scheduleJob('0 0 8 * * *', function(){
    // schedule.scheduleJob('1-10 * * * * *', function(){
    console.log(`scheduleCronstyle:${new Date()}`);
    (async () => {
      const last_url = JSON.parse(file);
      console.log("start running web crawler");
      await crawlEducationCentral(last_url);
      // PythonShell.run('./python/test.py', null, function (err, data) {
      //     if (err) console.log(err);
      //     //console.log(data.toString())
      //   });
      // var test = new PythonShell('./python/test.py', options);
      // test.on('message', function (message) {
      //   console.log(message);
      // });
    })();
    });
  }

  scheduleCronstyle();


  // (async()=>{
  // console.time("total time");
  //   var last_url = JSON.parse(file);
  //   // for(var num=4;num>1;num--){
  //   //   console.log(num);
  //   //   //console.log(News_URL+num+'/');
  //   //   await crawlEducationCentral(last_url,num);
  //   //
  //   // }
  //   //await crawlEducationCentral(last_url);
  //
  //   console.log("end");
  //   //run Python
  //   // PythonShell.run('./test.py', null, function (err, data) {
  //   //     if (err) console.log(err);
  //   //     console.log(data.toString())
  //   //   });
  //   // var test = new PythonShell('test.py', options);
  //   // test.on('message', function(message){
  //   //   console.log(message);
  //   // });
  //   console.timeEnd("total time");
  //
  // })();


  async function crawlEducationCentral(last_url) {
    console.time('crawl');
    const news = Crawlre.execute('news', News_URL, last_url);
    const features = Crawlre.execute('features', Features_URL, last_url);
    const opinion = Crawlre.execute('opinion', Opinion_URL, last_url);
    const teaching = Crawlre.execute('teaching', Teaching_And_Learning_URL, last_url);
    const sectors = Crawlre.execute('sectors', Sectors_URL, last_url);
    const future = Crawlre.execute('future', Future_URL, last_url);
    await Promise.all([news, features, opinion, teaching, sectors, future]).then((values) => {
      // console.log(values);
      console.timeEnd('crawl');
      console.log('processing data');
      const article_file = fs.readFileSync('./data/articles.json', 'utf8');
      // console.log("is empty?", article_file);
      if (article_file === '') {
        const data = JSON.stringify(values);
        fs.writeFileSync('./data/articles.json', data);
      } else {
        const article_content = JSON.parse(article_file);
        for (let i = 0; i < values.length; i ++) {
          if (values[i]) {
            console.log('push index: ', i, ', ', values[i].length, 'articles');
            for (let j = 0; j < values[i].length; j ++) {
              
              var article =values[i][j];
              article.categorize = false;
              article_content.push(article);
              dataService.pushScrapingData(article);
              
            }
          }
        }
        const data = JSON.stringify(article_content);
        fs.writeFileSync('./data/articles.json', data);

      }
    });
    console.log('finished processing');
    return new Promise(((resolve) => {
      resolve('ok');
    }));
  }

}

module.exports.crawlinit = crawlinit;