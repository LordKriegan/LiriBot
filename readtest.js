var fs = require('fs');
var os = require('os');
fs.readFileSync('random.txt', "utf8",function(err, data) {
    if (err) {
        console.error(err);
    }
    blah = data.split(os.EOL);
    console.log(blah[0]);
  });