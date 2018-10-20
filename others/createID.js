const fs = require('fs');

function createID(){
    console.log('processing data');
    const article_file = fs.readFileSync('./data/articles.json', 'utf8');
    // console.log("is empty?", article_file);
        const article_content = JSON.parse(article_file);
        // var id = 0;
        for(var article =0;article<article_content.length;article++){
            
            article_content[article].categorize = false;
            
        }
        const data = JSON.stringify(article_content);
        fs.writeFileSync('./data/articles1.json', data);
    
    console.log('finished processing');
}

module.exports.createID = createID;