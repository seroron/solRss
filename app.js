
/**
 * Module dependencies.
 */

var express = require('express');
var partials = require('express-partials');
var routes = require('./routes');
var user = require('./routes/user');
var rssSite = require('./routes/rssSite');
var updateRss = require('./cron/updateRss');
var http = require('http');
var path = require('path');

var app = express();

// schema
require("./schema/rssSchema.js")();
require("./schema/rssSiteSchema.js")();

// all environments
app.set('port', process.env.PORT || 8088);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(partials());
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/rssSite', rssSite.index);
app.get('/users', user.list);

var mongoose = require('mongoose');
global.db = mongoose.connect('mongodb://localhost/solRss',
                             function(err) {
                                 updateRss.startUpdate();
                             });

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
