
// schema
exports.connectDB = function(callback) {
    var mongoose = require('mongoose');
    global.db = mongoose.connect(
        process.env.DBURI || 'mongodb://localhost/solRss',
        function(err) {
            require("../schema/rssSchema.js")();
            require("../schema/rssSiteSchema.js")();

            callback(err);
        });

    return global.db;
};

