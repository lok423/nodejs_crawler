//Require Mongoose
var mongoose = require('mongoose');

//Define a schema
var Schema = mongoose.Schema;

var PrepareDataSchema = new Schema({
    title: String,
    description :String,
    author: String,
    originalDate:Date,
    content: [String],
    source:{
        name:String,
        href:String
    },
    tags: [String],
    refId: String,
    category:String,
    subCategory:String,
    type:String,
    weighty:Number,
    update_at: {
        type: Date,
        // `Date.now()` returns the current unix timestamp as a number
        default: Date.now()
      }

});

var PrepareData = mongoose.model("PrepareData", PrepareDataSchema);

module.exports = PrepareData;