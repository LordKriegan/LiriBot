var fs = require('fs');
var os = require('os');
var keys = require('./keys.js');
var axios = require('axios');
var Twitter = require('twitter');
var Spotify = require('node-spotify-api');

var spotify = new Spotify(keys.spotify);
var twitClient = new Twitter(keys.twitter);
var omdbApiKey = keys.omdb.apiKey;

function getTweets(strUsername, boolLogOutput) {
    var params = { screen_name: strUsername, count: 20 };
    twitClient.get('statuses/user_timeline', params, function (error, tweets, response) {
        var output = [];
        output.push("============" + new Date() + "============");
        output.push('Command: get-tweets')//setup initial parts of output
        if (!error) {
            output.push('User: ' + tweets[0].user.screen_name)
            for (i = tweets.length - 1; i >= 0; i--) {
                output.push("[" + tweets[i].created_at + "] " + tweets[i].text)//add tweets to output
            }

        } else {
            output.push(JSON.stringify(error, null, 2));
        }
        logOutput(output, boolLogOutput); //log the output to terminal, and log to liriLog.txt if necessary
    });
}
function spotSong(strSongName, boolLogOutput) {
    var output = [];
    output.push("============" + new Date() + "============");
    output.push('Command: spotify-this-song');//setup initial part of output
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
                        logOutput(output, boolLogOutput);//if track doesnt exist, search for The Sign by Ace of Base instead and log it.
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
                }//otherwise add each song in array to output
            }
            logOutput(output, boolLogOutput); // log output 
        }).catch(function (err) {
            console.error(err);
        });
}

function getMovie(strMovieName, boolLogOutput) {
    axios.get("https://www.omdbapi.com/?t=" + strMovieName + "&y=&plot=short&apikey=" + omdbApiKey)
        .then(function (response) {
            var output = [];
            output.push("============" + new Date() + "============");
            output.push('Command: movie-this');//setup initial part of output
            output.push("Title: " + response.data.Title);
            output.push("Year: " + response.data.Year);
            output.push("IMDB Rating: " + response.data.Ratings[0].Value);
            output.push("Rotten Tomatoes Rating: " + response.data.Ratings[1].Value);
            output.push("Country: " + response.data.Country);
            output.push("Language: " + response.data.Language);
            output.push("Plot: " + response.data.Plot);
            output.push("Main Cast: " + response.data.Actors);//add movie info to output
            logOutput(output, boolLogOutput); //log output
        })
        .catch(function (error) {
            var output = [];
            output.push("============" + new Date() + "============");
            output.push('Command: movie-this');//setup initial part of output
            output.push(error);
            output.push("============SEARCHING DEFAULT MOVIE============");//error! movie doesnt exist! add to output
            logOutput(output); //log output
            getMovie("Mr. Nobody", boolLogOutput); //search for Mr. Nobody instead.
        });
}

function logOutput(arrOutput, boolLogOutput) {
    for (var i = 0; i < arrOutput.length; i++) {
        console.log(arrOutput[i]);
    }//log output to terminal

    if (boolLogOutput) {//if boolLogOutput is true, save to external file. boolLogOutput needs to be passed around through functions because calls are asynchronous and a global var may not always be what we want it to be
        for (var i = 0; i < arrOutput.length; i++) {
            try {
            fs.appendFileSync("liriLog.txt", arrOutput[i] + "\n", "utf8");
            } catch (error) {
                console.log(error);
            }
        }
    }
}

function extCmds() {
    var data;//try opening up random.txt and running commands inside
    try {
        data = fs.readFileSync('random.txt', "utf8");
        var cmds = data.split("\n");
        var cmdsArgs;
        for (var i = 0; i < cmds.length - 1; i++) { //end of file will always have an empty string, ignore it by reducing loop iterations by 1
            cmdsArgs = cmds[i].split("|");
            liriCmd = cmdsArgs[0];
            if (cmdsArgs[1] === "-l") {
                liriLogOutput = true;
                liriCmdArg = cmdsArgs[2];
            } else {
                liriLogOutput = false;
                liriCmdArg = cmdsArgs[1];
            }
            runProg();
        }
    } catch (err) {//if failed log error to liriLog.txt either way
        var output = [];
        liriLogOutput = true;
        output.push("==============" + new Date() + "==============");
        output.push("Command: do-what-it-says");
        output.push("Error! " + JSON.stringify(err, null, 2));
        logOutput(output, liriLogOutput);
    }
}

function runProg() { //runProg is in a function because this code is called multiple times from the do-what-it-says function in a for loop. 
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
        extCmds();
    } else {
        console.error(`
        ${liriCmd} not recognized! Use one of the following: 
        get-tweets [-s] [-l] [username]
        spotify-this-song [-s] [-l] [song name]
        movie-this [movie [-s] [-l] [name]
        do-what-it-says
        Flags: [-s] saves command, [-l] logs output
        Flags MUST be used in this order.
        `)
    }
}

function saveCmd() {
    var saveStr = "";
    for (var i = 2; i < process.argv.length; i++) {
        if (process.argv[i] !== "-s") {
            saveStr += process.argv[i];
        }
        if ((i === 2) || (process.argv[i] === "-l")) {
            saveStr += "|";
        } else if (process.argv[i] !== "-s"){
            saveStr += " ";
        }//build string to save to file
    }
    saveStr = saveStr.trim();
    fs.appendFileSync('random.txt', saveStr + "\n", "utf8");//add command to list of saved commands
}
//PROG STARTS RUNNING HERE
var liriCmd = process.argv[2]; //cmd to execute
var liriCmdArg = "";
var liriLogOutput = false;
var i = 3;//starting at 3 to ignore initial command
if (process.argv[i] === "-s") {
    i++;
    saveCmd(); //if -s flag present, save command and increment i so flag wont be in command arguments
}
if (process.argv[i] === "-l") {
    i++;
    liriLogOutput = true;// if -l flag is present, set logOutput to true and increment i for <see above>
}
for (; i < process.argv.length; i++) {
    liriCmdArg += " " + process.argv[i]; //combine rest of argv into a single argument
}
liriCmdArg = liriCmdArg.trim(); //remove leading space

runProg(); //RUN IT!