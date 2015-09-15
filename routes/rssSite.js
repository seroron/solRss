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
    var url  = req.param('url');

    var errFunc = function(err) {
        console.log(err);

        RssSite.find(function (err, sites) {
            res.render('rssSite/index', { 
                'sites' : sites,
                'notice': "登録失敗"
            });
        });
    };

    var RssSite = global.db.model('RssSite');

    request(url)
        .pipe(new FeedParser())
        .on('error', function(err) {
	    // always handle errors
            errFunc(err);
        })
        .on('meta', function (meta) {
            var RssSite = global.db.model('RssSite');
            RssSite.create({title: meta.title, link: url}, 
                           function(err, doc){
                               if(err) {
                                   errFunc(err);
                               }

                               if(!err) {
                                   rssfunc.updateRssData(doc, function() {


                                       RssSite.find(function (err, sites) {
                                           res.render('rssSite/index', { 
                                               'sites' : sites,
                                               'notice': "登録成功"
                                           });
                                       });
                                   });
                               }
                           });
        });
};

exports.delete = function(req, res) {
    var RssSite = global.db.model('RssSite');
    console.log("delte id=" + req.params.id);

    RssSite.find({_id: req.params.id}, function (err, sites) {
        res.json({});
    });
};
