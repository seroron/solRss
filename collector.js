var FeedParser = require('feedparser');
var request = require('request');
var async = require('async');
var rssfunc = require('./cmn/rssfunc');
var cronJob = require('cron').CronJob;

var dbcmn = require('./cmn/dbCmn.js');
dbcmn.connectDB(function(err){
    if(err) {
        console.error(err);
    } else {
        new cronJob({
            cronTime: '*/15 * * * *'
            , onTick: update
            , start: true
        });
    }
});

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

