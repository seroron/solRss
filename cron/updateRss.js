var FeedParser = require('feedparser')
var request = require('request');
var async = require('async');

var registerRss = function(url, callback) {

    var Rss     = global.db.model('Rss');

    request(url)
        .pipe(new FeedParser({addmeta : true}))
        .on('error', function(error) {
	    // always handle errors
	    console.log(error);
        })
        .on('readable', function () {
	    var stream = this;
            var item;
	    while (item = stream.read()) {
                Rss.create({link: item.link,
                            title: item.title,
                            date: item.date,
                            siteTitle: item.meta.title},
                           function(err, doc) {
                               console.log(err);
                           });
	    }
        })
        .on('end',  function(){
            callback(null);
        })
}


var update = function() {
    var Rss     = global.db.model('Rss');
    var RssSite = global.db.model('RssSite');

    RssSite.find(function (err, doc) {
        async.each(doc, 
                   function(item, c) {
                       registerRss(item.link, c);
                   },
                   function(err) {
                   });
    });
}

exports.startUpdate = function() {
    setInterval(update, 1000 * 60 * 30);
}
