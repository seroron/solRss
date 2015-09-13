var FeedParser = require('feedparser');
var request = require('request');
var async = require('async');
var rssfunc = require('./cmn/rssfunc');

var dbcmn = require('./cmn/dbCmn.js');
dbcmn.connectDB(function(err){
    startUpdate();
});

var startUpdate = function() {
    update();
    setInterval(update, 1000 * 60 * 30);
};

var update = function() {
    var Rss     = global.db.model('Rss');
    var RssSite = global.db.model('RssSite');

    RssSite.find(function (err, doc) {
        async.each(doc, 
                   function(rssSite, c) {
                       rssfunc.updateRssData(rssSite, c);
                   },
                   function(err) {
                   });
    });
};

