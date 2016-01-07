var FeedParser = require('feedparser');
var request = require('request');
var us = require('underscore');

var rssfunc = require('../cmn/rssfunc');

exports.index = function(req, res){
  var RssSite = global.db.model('RssSite');

  RssSite.find(function (err, sites) {
    res.json(sites);
  });
};

exports.show = function(req, res){

  console.log(req.params.id);

  rssfunc.getRssList({rssSite: req.params.id}, 
                     100,
                     function(err, items) {
                       res.render('rssSite/show', { 
                         'items' : items
                       });
                     });
};

exports.create = function(req, res) {  
  var url  = req.body.url;
  console.log("add rss site:", url);

  var errFunc = function(err) {
    console.log("feed err: ", err);

    RssSite.find(function (err, sites) {
      res.json({stat: 'err', notice: '登録失敗'});
    });
  };

  var RssSite = global.db.model('RssSite');

  var feedparser = new FeedParser();
  feedparser.on('meta', function (meta) {
    var RssSite = global.db.model('RssSite');
    RssSite.create({title: meta.title, link: url}, 
                   function(err, doc){
                     if(err) {
                       errFunc(err);
                     }

                     if(!err) {
                       rssfunc.updateRssData(doc, function() {
                         RssSite.find(function (err, sites) {
                           res.json({stat: 'ok', notice: '登録成功'});
                         });
                       });
                     }
                   });
  });

  
  request({url: url,
           headers: {
             'User-Agent': rssfunc.rssUA
           }})
    .on('error', function (err) {
      errFunc(err);
    })
    .on('response', function (res) {
      var stream = this;

      if (res.statusCode != 200) {
        return this.emit('error', new Error('Bad status code: ' + res.statusCode));
      }
      
      return stream.pipe(feedparser);
    });  
};

exports.delete = function(req, res) {
    var RssSite = global.db.model('RssSite');
    console.log("delte id=" + req.params.id);

    RssSite.remove({_id: req.params.id}, function (err, sites) {
        res.json({});
    });
};
