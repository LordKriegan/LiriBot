var fs = require('fs');
var keys = require('./keys.js');
var axios = require('axios');
var Twitter = require('twitter');
var Spotify = require('node-spotify-api');

var spotify = new Spotify(keys.spotify);
var twitClient = new Twitter(keys.twitter);
var omdbApiKey = keys.omdb.apiKey;

function getTweets(strUsername) {
    var params = { screen_name: strUsername, count: 20 };
    twitClient.get('statuses/user_timeline', params, function (error, tweets, response) {
        var output = [];
        output.push("============" + new Date() + "============");
        output.push('Command: get-tweets')
        if (!error) {
            output.push('User: ' + tweets[0].user.screen_name)
            for (i = tweets.length - 1; i >= 0; i--) {
                output.push("[" + tweets[i].created_at + "] " + tweets[i].text)
            }

        } else {
            output.push(JSON.stringify(error, null, 2));
        }
        logOutput(output);
    });
}
function spotSong(strSongName) {
    var output = [];
    output.push("============" + new Date() + "============");
    output.push('Command: spotify-this-song');
    spotify
        .request('https://api.spotify.com/v1/search?q=track:"' + strSongName + '"&type=track')
        .then(function (data) {
            if (data.tracks.total === 0) {
                output.push("Song does not exist. Searching for something else instead.");
                spotify
                    .request('https://api.spotify.com/v1/search?q=track:"The Sign" artist:"Ace of Base"&type=track')
                    .then(function (data) {
                        var output = [];
                        output.push("============" + new Date() + "============");
                        output.push("============SEARCHING DEFAULT SONG============");
                        output.push('Command: spotify-this-song')
                        for (var i = 0; i < data.tracks.items.length; i++) {
                            output.push("Result Number " + (i + 1));
                            output.push("---------------");
                            for (var n = 0; n < data.tracks.items[i].artists.length; n++) {
                                output.push("Artist: " + data.tracks.items[i].artists[n].name);
                            }
                            output.push("Album: " + data.tracks.items[i].album.name);
                            output.push("Track: " + data.tracks.items[i].name);
                            output.push("Preview: " + data.tracks.items[i].preview_url);
                        }
                        logOutput(output);
                    })
                    .catch(function (err) {
                        console.error(err);
                    });
            } else {
                for (var i = 0; i < data.tracks.items.length; i++) {
                    output.push("Result Number " + (i + 1));
                    output.push("---------------");
                    for (var n = 0; n < data.tracks.items[i].artists.length; n++) {
                        output.push("Artist: " + data.tracks.items[i].artists[n].name);
                    }
                    output.push("Album: " + data.tracks.items[i].album.name);
                    output.push("Track: " + data.tracks.items[i].name);
                    output.push("Preview: " + data.tracks.items[i].preview_url);
                }
            }
            logOutput(output);
        }).catch(function (err) {
            console.error(err);
        });
}

function getMovie(strMovieName) {
    axios.get("https://www.omdbapi.com/?t=" + strMovieName + "&y=&plot=short&apikey=" + omdbApiKey)
        .then(function (response) {
            var output = [];
            output.push("============" + new Date() + "============");
            output.push('Command: movie-this');
            output.push("Title: " + response.data.Title);
            output.push("Year: " + response.data.Year);
            output.push("IMDB Rating: " + response.data.Ratings[0].Value);
            output.push("Rotten Tomatoes Rating: " + response.data.Ratings[1].Value);
            output.push("Country: " + response.data.Country);
            output.push("Language: " + response.data.Language);
            output.push("Plot: " + response.data.Plot);
            output.push("Main Cast: " + response.data.Actors);
            logOutput(output);
        })
        .catch(function (error) {
            var output = [];
            output.push("============" + new Date() + "============");
            output.push('Command: movie-this');
            output.push(error);
            output.push("============SEARCHING DEFAULT MOVIE============");
            logOutput(output);
            getMovie("Mr. Nobody");
        });
}

function logOutput(arrOutput) {
    for (var i = 0; i < arrOutput.length; i++) {
        console.log(arrOutput[i]);
    }

    if (liriLogOutput) {
        // console.log("SAVING SHIT");
        for (var i = 0; i < arrOutput.length; i++) {
            fs.appendFileSync("liriLog.txt", arrOutput[i] + "\r\n", "utf8", function (err) {
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
    getTweets(liriCmdArg, liriLogOutput);
}
else if (liriCmd === "spotify-this-song") {
    spotSong(liriCmdArg, liriLogOutput);
}
else if (liriCmd === "movie-this") {
    getMovie(liriCmdArg, liriLogOutput);
}
else if (liriCmd === "do-what-it-says") {
    console.log("external file cmds under construction");
} else {
    console.error(`
    Command not recognized! Use one of the following: 
    get-tweets [-s] [username]
    spotify-this-song [-s]  [song name]
    movie-this [movie [-s] [name]
    do-what-it-says [-s]
    Note: using the -s flag will log the output.`)
}