var FeedParser = require('feedparser');
var request = require('request');

var us = require('underscore');

var rssUA = 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:9.0.1) Gecko/20100101 Firefox/9.0.1';
exports.rssUA = rssUA;

exports.getSiteData = function(url, callback) {

    request(url)
        .pipe(new FeedParser({addmeta : true}))
        .on('error', function(err) {
            callback(err, null);
        })
        .on('meta', function (meta) {
            callback(null, meta);
        });
};

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
};

exports.updateRssData = function(rssSite, callback) {

    var Rss     = global.db.model('Rss');
    var RssSite = global.db.model('RssSite');

    var feedparser = new FeedParser();
    feedparser.on('error', function(err) {
        console.error("parse error: " + rssSite.title +": ", err);
    });
    feedparser.on('meta', function (meta) {
        //console.log("meta:" + meta.title + "  " + meta.link);

        RssSite.update({link: rssSite.link}, { $set: {title: meta.title}},
                       function(err, doc) {
                           if(err) {
                               console.log("meta:", err);
                           }
                       });
    });
    feedparser.on('readable', function() {
        var stream = this;
        var item;

        while (item = stream.read()) {
            //console.log("item: " + item.date + " " + item.title + "  " + item.link);

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
    });
    feedparser.on('end',  function(){
        //console.log("parser end");
        callback(null);
    });

  request({url: rssSite.link,
           headers: {
             'User-Agent': rssUA
           }})

    .on('error', function (err) {
      console.error("request error: " + rssSite.title +": ", err);
    })
    .on('response', function (res) {
      var stream = this;
      if (res.statusCode != 200) {
        return this.emit('error', new Error('Bad status code'));
      }

      return stream.pipe(feedparser);
    });
};

