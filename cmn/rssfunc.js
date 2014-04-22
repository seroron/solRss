var FeedParser = require('feedparser')
var request = require('request');

var us = require('underscore');


exports.getSiteData = function(url, callback) {

    request(url)
        .pipe(new FeedParser({addmeta : true}))
        .on('error', function(err) {
            callback(err, null);
        })
        .on('meta', function (meta) {
            callback(null, meta);
        })
}

exports.getRssList = function(query, lim, callback) {

    var Rss  = global.db.model('Rss');
    
    query["title"] = {$not: /^PR:/};

    Rss.find(query)
        .populate('rssSite')
        .sort({date: 'desc'})
        .limit(lim)
        .exec(function(err, items) {
            if(items) {
                ix = us.map(items, function(i){
                    var obj = i.toObject();
                    obj.mili_time = i.date.getTime();
                    return obj;
                });

                callback(null, ix);

            } else {
                callback(err, null);
            }
        });
}

exports.updateRssData = function(rssSite, callback) {

    var Rss     = global.db.model('Rss');
    var RssSite = global.db.model('RssSite');

    request(rssSite.link)
        .pipe(new FeedParser())
        .on('error', function(err) {
	    console.error("on error:", err);
        })
        .on('meta', function (meta) {
            RssSite.update({link: rssSite.link}, { $set: {title: meta.title}},
                           function(err, doc) {
                               if(err) {
                                   console.log("meta:", err);
                               }
                           });
        })
        .on('readable', function () {
	    var stream = this;
            var item;
	    while (item = stream.read()) {
                Rss.findOneAndUpdate({link: item.link},
                                     { $set: {link: item.link,
                                              title: item.title,
                                              date: item.date,
                                              rssSite: rssSite._id}},
                                     {upsert: true},
                                     function(err, doc) {
                                         if(err) {
                                             console.log("findAndUpdate:", err);
                                         }
                                     });
	    }
        })
        .on('end',  function(){
            callback(null);
        })
}
