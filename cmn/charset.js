var spawn = require('child_process').spawn;

exports.encode = function(input, callback) { 

    var nkf = spawn('nkf', ['-w']);
    var out = "";
    var err = "";


    nkf.stdout.on('data', function (data) {
        out += data;
    });

    nkf.stderr.on('data', function (data) {
        err += data;
    });

    nkf.on('close', function (code) {
        if(code != 0) {
            err += "return code:" + code;
        }
        
        callback(err, out);
    });

    nkf.stdin.write(input);
    nkf.stdin.end();
}
