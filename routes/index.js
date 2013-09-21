
/*
 * GET home page.
 */

var FeedParser = require('feedparser')
var request = require('request');
var async = require('async');
var us = require('underscore');


exports.index = function(req, res){

    var Rss  = global.db.model('Rss');
    Rss.find().sort({date: 'desc'}).limit(100).exec(function(err, items) {
        // items.sort(function(a, b) {
        //     return b.date.getTime() - a.date.getTime();
        // });
        items = us.groupBy(items,
                           function(i) {
                               return "" + i.date.getFullYear() + 
                                   "/" + (i.date.getMonth()+1) + 
                                   "/" + i.date.getDate();
                           });
        
        res.render('index', { 
            'items' : items
        })
        
    });
};
