
exports.index = function(req, res){
    var RssSite = global.db.model('RssSite');

    RssSite.find(function (err, sites) {
        console.log(sites);

        res.render('rssSite/index', { 
            'sites' : sites
        })
    });
}
