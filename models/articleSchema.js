//Require Mongoose
var mongoose = require('mongoose');

//Define a schema
var Schema = mongoose.Schema;

var ArticleModelSchema = new Schema({
    precategory: String,
    
    title: String,
    description :String,
    author: String,
    date:Date,
    content: [String],
    source:{
        name:String,
        href:String
    },
    tags: [String],
    categorize: {
        type: Boolean,
        // `Date.now()` returns the current unix timestamp as a number
        default: false
      }

});

var Article = mongoose.model("Article", ArticleModelSchema);

module.exports = Article;