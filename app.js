var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var http = require('http');
var errorHandler = require('errorhandler');

var routes = require('./routes');
var rss     = require('./routes/rss');
var rssSite = require('./routes/rssSite');

var app = express();

// all environments
app.set('port', process.env.PORT || 18088);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(methodOverride());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'bower_components')));

if ('development' == app.get('env')) {
    app.use(errorHandler());
}

app.get('/', routes.index);
app.get('/rss', rss.index);
//app.get('/rss/:id', rss.show);
app.post('/rss/:id', rss.update);
app.get('/rssSite', rssSite.index);
//app.get('/rssSite/:id', rssSite.show);
app.post('/rssSite', rssSite.create);
app.delete('/rssSite/:id', rssSite.delete);
app.get('*', function(req, res){res.render('index');});

var dbcmn = require('./cmn/dbCmn.js');
dbcmn.connectDB(function(err){

    http.createServer(app).listen(app.get('port'), function(){
        console.log('Express server listening on port ' + app.get('port'));
    });
});
