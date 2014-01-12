
var rssfunc = require('../cmn/rssfunc');

exports.index = function(req, res){
    rssfunc.getRssList({}, 
                       function(err, items) {
                           res.json(items);
                       });
}

exports.show = function(req, res){

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

    var Rss  = global.db.model('Rss');    

    if(req.query.favorite == 'true') {
        Rss.findByIdAndUpdate(id, {$set: {favorite: true}})
            .exec(function(err, item) {
                if(err) {
                    res.send(404);
                    return;
                }
                
                res.location('/');
            });
    } else if(req.query.favorite == 'false') {
    }
}