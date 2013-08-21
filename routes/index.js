
/*
 * GET home page.
 */

var FeedParser = require('feedparser')
var request = require('request');
var async = require('async');
var us = require('underscore');

var getRssInfo = function(url, callback) {
    var meta;
    var items = [];

    request(url)
        .pipe(new FeedParser({addmeta : true}))
        .on('error', function(error) {
	    // always handle errors
	    console.log(error);
        })
        .on('meta', function (m) {
            meta = m;
        })
        .on('readable', function () {
	    var stream = this;
            var item;
	    while (item = stream.read()) {
                items.push(item);
	    }
        })
        .on('end',  function(){
            callback(meta, items);
        })
}

var getRssInfoList = function(urls, callback) {
    async.concat(urls, 
                 function(url, c) {
                     getRssInfo(url, function(meta, items) {
                         c(null, items);
                     });
                 },
                 callback
                );
}

exports.index = function(req, res){
    getRssInfoList(['http://d.hatena.ne.jp/yaneurao/rss',
                    'http://feed.rssad.jp/rsshttp://www.100shiki.com/feed',
                    'http://www.ideaxidea.com/feed',
                    'http://cpplover.blogspot.com/feeds/posts/default',
                    'http://feed.rssad.jp/rss/gigazine/rss_2.0',
                    'http://www.publickey1.jp/atom.xml',
                    'http://b.hatena.ne.jp/entrylist/it?sort=hot&threshold=&mode=rss'],
                   function(err, items) {

                       items.sort(function(a, b) {
                           return b.date.getTime() - a.date.getTime();
                       });
                       items = us.groupBy(items,
                                          function(i) {
                                              return "" + i.date.getFullYear() + 
                                                  "/" + (i.date.getMonth()+1) + 
                                                  "/" + i.date.getDate();
                                          });

                       res.render('index', { 
//                           'title' : meta.title,
                           'items' : items
                       })
                   });
};
