var request = require('request');
var async = require('async');

var rssfunc = require('../cmn/rssfunc');

exports.index = function(req, res){
    console.log(req.query);

    var rssSite = req.query.rssSite;
    if(!rssSite) {
        rssSite = "";
    }

    res.render('index', { 
        //'items' : items
        'rssSite': rssSite
    })        

    // rssfunc.getRssList({}, 
    //                    function(err, items) {
    //                        res.render('index', { 
    //                            'items' : items
    //                        })        
    //                    });
}
