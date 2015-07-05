var rssfunc = require('../cmn/rssfunc');
var us = require('underscore');


exports.index = function(req, res){
    
    var query = {};
    if(req.query.rssSite) {
        query.rssSite = req.query.rssSite;
    }

    query.date = {};
    if(req.query.beginDate) {
        us.extend(query.date ,{$lt : new Date(parseInt(req.query.beginDate))});
    }
    if(req.query.endDate) {
        us.extend(query.date ,{$gt : new Date(parseInt(req.query.endDate))});
    }
    console.log(query.date);
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

    console.log(req.body);
    var Rss  = global.db.model('Rss');    

    Rss.findByIdAndUpdate(req.params['id'], 
                          {$set: {read: req.body.read, 
                                  favorite: req.body.favorite}})
        .populate('rssSite')
        .exec(function(err, item) {
            if(err) {
                res.send(404);
                return;
            }
            res.json(item);
        });
};
