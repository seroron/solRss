
exports.index = function(req, res){
    var RssSite = global.db.model('RssSite');

    RssSite.find(function (err, sites) {
        console.log(sites);

        res.render('rssSite/index', { 
            'sites' : sites
        })
    });

    RssSite.create({title: "", link: 'http://d.hatena.ne.jp/yaneurao/rss'}, function(err, doc){console.log(err);});
    RssSite.create({title: "", link: 'http://www.ideaxidea.com/feed'}, function(err, doc){console.log(err);});
    RssSite.create({title: "", link: 'http://cpplover.blogspot.com/feeds/posts/default'}, function(err, doc){console.log(err);});
    RssSite.create({title: "", link: 'http://feed.rssad.jp/rss/gigazine/rss_2.0'}, function(err, doc){console.log(err);});
    RssSite.create({title: "", link: 'http://www.publickey1.jp/atom.xml'}, function(err, doc){console.log(err);});
    RssSite.create({title: "", link: 'http://b.hatena.ne.jp/entrylist/it?sort=hot&threshold=&mode=rss'}, function(err, doc){console.log(err);});
}

