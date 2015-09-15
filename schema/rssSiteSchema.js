var mongoose = require('mongoose');

module.exports = function() {
    var RssSiteSchema = new mongoose.Schema({
        title: {type: String},
        link:  {type: String, 
                required: true,
                unique: true}
    });
    mongoose.model("RssSite", RssSiteSchema);
};


