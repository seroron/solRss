
/*
 * GET home page.
 */

var request = require('request');
var async = require('async');

var rssfunc = require('../cmn/rssfunc');

exports.index = function(req, res){
    
    rssfunc.getRssList({}, 
                       function(err, items) {
                           res.render('index', { 
                               'items' : items
                           })        
                       });
}
