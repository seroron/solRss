var rssfunc = require('../cmn/rssfunc');
var us = require('underscore');


exports.index = function(req, res){
    
    var query = {};
    if(req.query.rssSite) {
        query.rssSite = req.query.rssSite;
    }
    if(req.query.favorite) {
        query.favorite = req.query.favorite;
    }

    query.date = {};
    if(req.query.beginDate) {
        us.extend(query.date ,{$lt : new Date(parseInt(req.query.beginDate))});
    }
    if(req.query.endDate) {
        us.extend(query.date ,{$gte : new Date(parseInt(req.query.endDate))});
    }
    if(us.isEmpty(query.date)) {
        delete query.date;
    }

    console.log("rss index:",query);
    rssfunc.getRssList(query, 
                       25,
                       function(err, items) {
                           res.json(items);
                       });
};

exports.show = function(req, res) {

    var id = req.param('id');

    var Rss  = global.db.model('Rss');    
    Rss.findByIdAndUpdate(id, {$set: {read: true}})
        .exec(function(err, item) {
            if(err) {
                res.send(404);
                return;
            }
            
            res.redirect(item.link);
        });
};

exports.update = function(req, res) {

    var Rss  = global.db.model('Rss');    

    var data = {};
    if(req.body.read != null) {
        data.read = !!req.body.read;
    }
    if(req.body.favorite != null) {
        data.favorite = !!req.body.favorite;
    }

    Rss.findByIdAndUpdate(req.params['id'], {$set: data})
        .populate('rssSite')
        .exec(function(err, item) {
            if(err) {
                res.send(404);
                return;
            }
            res.json('ok');
        });
};

