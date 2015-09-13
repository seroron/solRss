var mongoose = require('mongoose');

module.exports = function() {
    var RssSchema = new mongoose.Schema({
        link:  {type: String, 
                required: true,
                unique: true},
        title: {type: String,
                required: true},
        date: {type: Date},
        rssSite: {type: mongoose.Schema.Types.ObjectId, ref: 'RssSite'},
        read: {type: Boolean},
        favorite: {type: Boolean}
    });

    mongoose.model("Rss", RssSchema);
};


