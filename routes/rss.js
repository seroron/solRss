var rssfunc = require('../cmn/rssfunc');

exports.index = function(req, res){
    
    var query = {};
    if(req.query.rssSite) {
        query.rssSite = req.query.rssSite;
    }
    if(req.query.beginDate) {
        console.log('query:', req.query.beginDate);
        query.date = {$lt : new Date(parseInt(req.query.beginDate))};
//        query._id  = {$lt : req.query.beginID};
    }

    console.log("rss index:",query);
    rssfunc.getRssList(query, 
                       25,
                       function(err, items) {
                           res.json(items);
                       });
}

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
}

exports.update = function(req, res) {

    console.log(req.body);
    var Rss  = global.db.model('Rss');    

    Rss.findByIdAndUpdate(req.param('id'), 
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
}
