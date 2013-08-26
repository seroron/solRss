var mongoose = require('mongoose');

module.exports = function() {
    var RssSchema = new mongoose.Schema({
        link:  {type: String, 
                required: true,
                unique: true},
        title: {type: String,
                required: true},
        date: {type: Date},
        siteTitle: {type: String}
        
    });
    mongoose.model("Rss", RssSchema)
};


