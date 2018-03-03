/*
  * Discord Bot created for recreational purposes
  * Liam Lightfoot

*/



const Discord = require("discord.js");
const fetch = require("node-fetch");
const funct = require("./functions");
const client = new Discord.Client();

const timeout = 6000 * 1;
const reddit = ['https://www.reddit.com/r/fluffy.json', 'https://www.reddit.com/r/aww/top.json', 'https://www.reddit.com/r/tippytaps/top.json'];

var prefix = "!";

client.on("ready", () => {
  console.log("I am ready!");
  //setInterval(generateFluffyPic, timeout);
});

client.on("message", (message) => {
    if(message == prefix + "generateFluffy"){
      console.log("Generating Fluffy Picture")
      generateFluffyPic();
    }

    if(message == prefix + "getQuotes"){
      client.channels.get('261789412881465344').fetchMessages()
        .then(messages => selectAQuote(messages.array(), message))
        .catch(console.error);
    }
});

function selectAQuote(messages, channel){
    var content = [];

    messages.forEach(function(elements) {
      content.push(elements.content);
    });
    for(var i = 0; i < content.length; i++){
      if(!(content[i].includes('-'))){
        content.splice(i, 1);
      }
    }

    channel.channel.send(content[Math.floor(Math.random() * content.length)]);
}

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
  if(res.length < 3){
    random = Math.floor(Math.random() * (res.length - 0));
  } else{
    random = Math.floor(Math.random() * (3 - 0));
  }
  showFluffyPic(res[random].imgur, res[random].sub);
})
.catch(function(err){
  console.log('Fetch Error :-S', err);
})
  //console.log(image);
}

function showFluffyPic(imgLocation, subreddit){
  console.log(imgLocation);
  if(imgLocation.indexOf("http") !== -1){
    console.log("Sending image");
    console.log(imgLocation);
    client.channels.get('397211084534186006').send("Top post from the " + subreddit + " subreddit.");
    client.channels.get('397211084534186006').send(imgLocation);
  } else{
    generateFluffyPic();
  }
}


client.login("Mzk3MzEyMjkzNDQyMTU4NTky.DSuLtg.hpm0h5IBWs5c4F5nR5lto9gawFA");
