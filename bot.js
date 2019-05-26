/*
  * Discord Bot created for recreational purposes
  * Liam Lightfoot

*/
const Discord = require("discord.js");
const fetch = require("node-fetch");
const opusscript = require("opusscript");
const funct = require("./functions");
const config = require("./package.json");
const fs = require("fs");
const ttsGoogle = require("google-tts-api");
const client = new Discord.Client();

const soundQuoteFolder = "./Sounds/TS3/";
const timeout = 60 * 1;
var reddit = ['https://www.reddit.com/r/fluffy.json', 'https://www.reddit.com/r/aww/top.json', 'https://www.reddit.com/r/tippytaps/top.json', 'https://www.reddit.com/r/awwgifs.json', 'https://www.reddit.com/r/kittengifs/.json'];

var soundQuotes = [];
var soundQuotesMapped = [];
var prefix = "!";


client.on("ready", () => {
  populateSoundQuotes(soundQuoteFolder, soundQuotes);
  mapSoundQuotes(soundQuotes, soundQuotesMapped);
  console.log("I am ready!");
  console.log("I am a bot!");
  //setInterval(generateFluffyPic, timeout);
});

client.on("disconnect", (eventClose) =>{

});

client.on("voiceStateUpdate", (oldmember, newmember) =>{
  if(newmember.presence != "offline"){
    announceUser(newmember);
  }
})

//Hooks into discords API for the server and searches messages for specific tokens
client.on("message", (message) => {
    if(message == prefix + "cleanCommands"){
      console.log("Removing lines starting with !");
      message.channel.fetchMessages({limit: 100})
        .then(messages => removeCommands(messages))
        .catch(console.error);
    }

    if(message.content.split(" ")[0] == prefix + "voices"){
      console.log("Test");
      voices(message, soundQuotesMapped, soundQuoteFolder);
    }

    if(message == prefix + "disconnect"){
      client.destroy();
    }

    if(message == prefix + "joinChannel"){
      try{
        message.member.voiceChannel.join();
      } catch(err){
        console.log(err);
      }
    }

    if(message.content.split("'")[0] == prefix + "stealAvatar "){
      console.log(message.content.split("'")[1]);
        checkGuildContains(message.content.split("'")[1], message);
      }

    if(message == prefix + "generateFluffy"){
      console.log("Generating Fluffy Picture")
      generateFluffyPic();
    }

    if(message == prefix + "getQuotes"){
      client.channels.get('').fetchMessages({limit: 100})
        .then(messages => selectAQuote(messages.array(), message))
        .catch(console.error);
    }

    if(message == prefix + "ff14Meme"){
      if(message.channel.id == ''){
        client.channels.get('').fetchMessages({limit: 20})
          .then(messages => reduceClutter(messages))
          .catch(console.error);
        message.channel.send('To reduce meme clutter you cannot use this command in this channel. https://tenor.com/view/disney-moana-pig-sad-eyes-gif-7539569 \nPlease use this command in any other channel!');
      }else{
        client.channels.get('').fetchMessages({limit: 100})
          .then(messages => getAttachments(messages.array(), message))
          .catch(console.error);

        console.log("Recognised proper channel.")
      }
    }
});

//Removes commands from channel
function removeCommands(messages){
  messages.forEach(function(ele) {
      if(ele.content.charAt(0) == prefix){
        ele.delete();
      }
  })
}

//Option which gets a bunch of quotes from a quotes channel and prints one out at random
function selectAQuote(messages, channel){
    var content = [];

    messages.forEach(function(elements) {
      content.push(elements.content);
    });

    console.log(content.length);
    for(var i = content.length - 1;  i >= 0; i--){
      if(content[i].charAt(0) != '"'){
        console.log("Removing: " + content[i]);
        content.splice(i, 1);
      }
    }

    console.log(content.length);
    console.log(content);

    channel.channel.send(content[Math.floor(Math.random() * content.length)]);
}

//Fetches a bunch (10) of fluffy images from the reddit API
//Maps them to an array then randomly selects one and calls showFluffyPic to display it in channel
function generateFluffyPic(){
  var image = "f";
  var res;
  console.log("Check");
  fetch(reddit[Math.floor(Math.random() * reddit.length)])
  .then(res=>res.json())
  .then(res=>res.data.children)
  .then(res=>res.map(post=>({
  author: post.data.author,
  link: post.data.url,
  img: post.data.thumbnail,
  imgur: post.data.url,
  title: post.data.title,
  sub: post.data.subreddit
  })))
  .then(function(res){
  var random;
  if(res.size < 10){
    random = Math.floor(Math.random() * (res.size - 0));
  } else{
    random = Math.floor(Math.random() * (10 - 0));
  }
  showFluffyPic(res[random].imgur, res[random].sub);
  })
  .catch(function(err){
  console.log('Fetch Error :-S', err);
})
  //console.log(image);
}

//Posts a fluffy pic to the fluffy channel
function showFluffyPic(imgLocation, subreddit){
  console.log(imgLocation);
  if(imgLocation.indexOf("http") !== -1){
    console.log("Sending image");
    console.log(imgLocation);
    client.channels.get('').send("Top post from the " + subreddit + " subreddit.");
    client.channels.get('').send(imgLocation);
  } else{
    generateFluffyPic();
  }
}

//Uses RegEX to extract attachments from a channel (imgs, audio files, etc)
//Pushes any html links into an array so that we can generate the attachment again later
//Sends a random link to a quotes channel
function getAttachments(messages, channel){
  var attachments = [];
  var links = [];
  let regHTML = new RegExp("https:.*");
  messages.forEach(function(element){
    if(element.attachments.size > 0){
      attachments.push(element.attachments);
    }
    if(regHTML.test(element.content) && !(element.content.includes("https://tenor.com/view/disney-moana-pig-sad-eyes-gif-7539569"))){
      links.push(element.content);
    }
    if(element.content.includes("https://tenor.com/view/disney-moana-pig-sad-eyes-gif-7539569")){
      element.delete();
    }
  })

  attachments.forEach(function(elements){
    links.push(elements.map(src => src.url));
  })

  console.log(attachments);
  console.log(links);
  channel.channel.send(links[Math.floor(Math.random() * links.length)]);
}

//Removes the image posted whenever someone posts a command in the wrong channel
function reduceClutter(messages){
  messages.forEach(function (ele){
    if(ele.content.includes("https://tenor.com/view/disney-moana-pig-sad-eyes-gif-7539569")){
      ele.delete();
    }
  })
}

//Enumerates over everyone in the server checking to see if the specified user is in the server
//If they are we extract the avatarURL such that we can 'steal' it.
function checkGuildContains(user, message){
  var guildArray = message.guild.members.array();
  var members = [];
  var avatar;
  guildArray.forEach(function (ele){
    members.push({user: ele.user.username, nickname: ele.nickname});
  })

  if(checkUsers(members,user) || checkNicknames(members, user)){
    console.log("start finding loop");
    guildArray.forEach(function(ele){
      if(ele.user.username == user || ele.nickname == user){
        console.log("checks");
        avatar = ele.user.avatarURL;
      }
    })
  }
  console.log(avatar);

  if(avatar != undefined){
    message.channel.send("SUCCESS! We have stolen " + user + "'s Avatar. \n" + avatar);
  } else{
    message.channel.send("Error, we could not locate the user.");
  }
}

//For the checkGuildContains function.
//Checks to see if the provided username matches any nicknames on the server
function checkNicknames(members, user){
  var nickNames = [];
  for(var item of members){
    nickNames.push(item.nickname);
  }
  for(var i = 0; i < nickNames.length; i++){
    if(nickNames[i] == user){
      return true;
    }
  }

  return false;
}

//For the checkGuildContains function.
//Checks to see if the provided username matches any usernames on the server
function checkUsers(members, user){
  var users = [];

  for(var item of members){
    users.push(item.user);
  }
  for(var i = 0; i < users.length; i++){
    if(users[i] == user){
      return true;
    }
  }

  return false;
}

//Plays a voice file from the sounds folder mapped to 0-18
function voices(message, arr, quoteFolder){
  var helpArr = [];
  var voiceChannel = message.member.voiceChannel;
  var voiceMsg = message.content.split(" ")[1];
  if(voiceMsg != 'help'){
    var file = getVoiceFile(voiceMsg, arr, quoteFolder);

    console.log(file);
    if(file == "File not found"){
      message.channel.send("Is that a valid voice file? \n Use `![voiceCommand] help` for a list!");
    } else{
      voiceChannel.join().then(connection => {
        const dispatcher = connection.playFile(file);
      }).catch(err => {
        console.log(err);
      });
    }
  } else{
    message.author.send("These are the voice files!");
    arr.forEach(obj => {
      helpArr.push(obj.ID + ": " + obj.Location);
    })
    message.author.send(helpArr);
  }
}

//Gets the file ID which was mapped against previously
function getVoiceFile(id, arr, flocation){
  for(var i = 0; i < arr.length; i++){
    if(arr[i].ID == id){
      return flocation + arr[i].Location;
    }
  }
  return "File not found";
}

//pushes the directory for each sound file
function populateSoundQuotes(dir, arr){
  fs.readdirSync(dir).forEach(file => {
    arr.push(file);
  })
}

//maps the directory for each sound file
function mapSoundQuotes(arr, arrMap){
  for(var i = 0; i < arr.length; i++){
    arrMap.push({ID: i, Location: arr[i]});
  }
}

//Uses googles TTS API to say when a user has joined the channel
//Bot needs to be in the same channel that the user is joining
function announceUser(newMember){
  var botEnabledOnServer = false;
  var server = newMember.voiceChannel.name;
  var name = newMember.displayName;
  var channelVoiceConnection;
  var botVoiceConnections = client.user.client.voiceConnections;
  //console.log(botVoiceConnections);
  botVoiceConnections.forEach(voiceConnection =>{
    if(voiceConnection.channel.name == server){
      botEnabledOnServer = true;
      //console.log(voiceConnection);
      channelVoiceConnection = voiceConnection;
    //  console.log(channelVoiceConnection);
    }
  })
  if(botEnabledOnServer){
    //console.log(channelVoiceConnection);
    console.log(name + " has joined " + channelVoiceConnection.channel.name);

    ttsGoogle(name + ' has joined your channel', 'en', 1)   // speed normal = 1 (default), slow = 0.24
    .then(url => {
      console.log(url); // https://translate.google.com/translate_tts?...
      fetch(url)
        .then(res => {
          const dest = fs.createWriteStream('./greeting.wav');
          res.body.pipe(dest);

          const dispatcher = channelVoiceConnection.playFile("./greeting.wav");
        })
    })
    .catch(function (err) {
      console.error(err.stack);
    });
  }


}

client.login(config.token);
