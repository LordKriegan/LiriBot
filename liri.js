var Twitter = require('twitter');
var twitClient = new Twitter(require("./keys.js"));

function getTweets(username) {
    var params = {screen_name: username, count: 20};
    twitClient.get('statuses/user_timeline', params, function(error, tweets, response) {
      if (!error) {
        console.log(tweets[0].text)
    
        console.log('User: ' + tweets[0].user.screen_name)
        for (i = tweets.length - 1; i >= 0; i--) {
            console.log("[" + tweets[i].created_at + "] " + tweets[i].text)
        } 
      } else {
          console.error(error);
      }
    });
}

var liriCmd = process.argv[2];
var liriCmdArg = "";
for (var i = 3; i < process.argv.length; i++) {
    liriCmdArg += " " + process.argv[i];
}
liriCmdArg = liriCmdArg.trim(); //remove leading space

if (liriCmd === "get-tweets") {
    getTweets(liriCmdArg);
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
    get-tweets [username]
    spotify-this-song [song name]
    movie-this [movie name]
    do-what-it-says`)
}