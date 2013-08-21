var mongoose = require('mongoose');

var RssSiteSchema = new mongoose.Schema({
    title: {type: String},
    link:  {type: String}
});

