var Twitter = require('twitter');
var fs = require('fs');
var twitClient = new Twitter(require("./keys.js"));

function getTweets(strUsername, boolLogOutput) {
    var params = {screen_name: strUsername, count: 20};
    twitClient.get('statuses/user_timeline', params, function(error, tweets, response) {
      if (!error) {
        var output = [];
        output.push("============" + new Date() + "=============");
        output.push('Command: get-tweets')
        output.push('User: ' + tweets[0].user.screen_name)
        for (i = tweets.length - 1; i >= 0; i--) {
            output.push("[" + tweets[i].created_at + "] " + tweets[i].text)
        }
        logOutput(output, boolLogOutput);
      } else {
          console.error(error);
      }
    });
}

function logOutput(arrOutput, boolLogOutput) {
    for (var i = 0; i < arrOutput.length; i++) {
        console.log(arrOutput[i]);
    }

    if (boolLogOutput) {
        // console.log("SAVING SHIT");
        for (var i = 0; i < arrOutput.length; i++) {
            fs.appendFileSync("liriLog.txt", arrOutput[i] + "\r\n", "utf8", function(err) {
                if (err) {
                    console.error(err);
                }
            });
        }
    }
}

var liriCmd = process.argv[2];
var liriCmdArg = "";
var liriLogOutput = false;
var i = 3;
if (process.argv[i] === "-s") {
    i++;
    liriLogOutput = true;
}

for (; i < process.argv.length; i++) {
    liriCmdArg += " " + process.argv[i];
}
liriCmdArg = liriCmdArg.trim(); //remove leading space

if (liriCmd === "get-tweets") {
    output = getTweets(liriCmdArg, liriLogOutput);
}
else if (liriCmd === "spotify-this-song") {
    console.log("Spotify under construction");
}
else if (liriCmd === "movie-this") {
    console.log("OMDB under construction");
}
else if (liriCmd === "do-what-it-says") {
    console.log("external file cmds under construction");
} else {
    console.error(`
    Command not recognized! Use one of the following:
    get-tweets [-s] [username]
    spotify-this-song [-s]  [song name]
    movie-this [movie [-s] name]
    do-what-it-says [-s]
    Note: using the -s flag will log the output.`)
}