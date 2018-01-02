const Discord = require("discord.js");
const fetch = require("node-fetch");
const funct = require("./functions");
const client = new Discord.Client();

const timeout = 6000 * 1;
const reddit = ['https://www.reddit.com/r/fluffy.json', 'https://www.reddit.com/r/Floof.json', 'https://www.reddit.com/r/tippytaps.json'];

client.on("ready", () => {
  console.log("I am ready!");
  //setInterval(generateFluffyPic, timeout);
});

client.on("message", (message) => {

});

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
  title: post.data.title
})))
.then(function(res){
  showFluffyPic(res[Math.floor(Math.random() * (res.length - 0))].imgur);
})
.catch(function(err){
  console.log('Fetch Error :-S', err);
})
  //console.log(image);
}

function showFluffyPic(imgLocation){
  console.log(imgLocation);
  if(imgLocation.indexOf("http") !== -1){
    console.log("Sending image");
    console.log(imgLocation);
    //client.channels.get('397211084534186006').send(imgLocation);
  } else{
    generateFluffyPic();
  }
}


client.login("Mzk3MzEyMjkzNDQyMTU4NTky.DSuLtg.hpm0h5IBWs5c4F5nR5lto9gawFA");
