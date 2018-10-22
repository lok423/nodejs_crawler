//Require Mongoose
var mongoose = require('mongoose');

//Define a schema
var Schema = mongoose.Schema;

var ScrapingSchema = new Schema({
    website: String,
    category: String,
    last_visited_url :String,
    update_at:Date

});

var ScrapingUrl= mongoose.model("ScrapingWeb", ScrapingSchema);

module.exports = ScrapingUrl;