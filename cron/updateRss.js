var mongoose = require('mongoose');
var db = mongoose.connect('mongodb://localhost/solRss');

var RssSiteSchema = new mongoose.Schema({
    title: {type: String},
    link:  {type: String}
});

var RssSite = db.model('rsssite',RssSiteSchema);

var rsssite = new RssSite({title: "やねうらお", link: "http://d.hatena.ne.jp/yaneurao/rss"});
rsssite.save();
