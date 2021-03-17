require('dotenv').config();
const Bot = new (require('discord.js').Client)();
const fetch = require('node-fetch');

var TOKEN = process.env.DISCORDTOKEN;
var NAME = process.env.DISCORDNAME;
var CHANNEL = '812110829285015642'; // ID of the channel which this bot looks at

Bot.sendMessage = (content, channel) => (Bot.channels.cache.get(channel ?? CHANNEL) ?? {send: () => null}).send(content);

async function BotLogin(token, name, channel) {
    if(token) TOKEN = token;
    if(name) NAME= name;
    if(channel) CHANNEL = channel;
    await Bot.login(TOKEN);
    console.log(`[DISC] Logged in as ${NAME}`);
}

Bot.on('error', err => {
    console.log(`[DISC] !! Error in bot ${NAME}:\n{err}`);
});

// Dictates bot behavior when it sees a message being sent.
async function onMessage(msg) {
  if(msg.content === 'hi')
    msg.channel.send('Hi Arash! I hope you are doing well!')

  else if(msg.content === 'allbuses!') {
    fetch("https://api.devhub.virginia.edu/v1/transit/routes/").then(r => r.json()).then(data => {
      var routesLength = data.routes.length;
      var arr = []
      for (var i = 0; i < routesLength; i++) {
      	arr.push(data.routes[i].long_name + " or " + data.routes[i].short_name)
       }
      msg.channel.send(arr)},
      r => msg.channel.send('Cannot access weather'))
  }

  else if(msg.content === 'buses!') {
    fetch("https://api.devhub.virginia.edu/v1/transit/routes/").then(r => r.json()).then(data => {
      var routesLength = data.routes.length;
      var arr = [];
      var inactiveArr = [];
      for (var i = 0; i < routesLength; i++) {
        if (data.routes[i].is_active === true) {
      		arr.push(data.routes[i].long_name + " or " + data.routes[i].short_name)
        }
       }
      for (var i = 0; i < routesLength; i++) {
       if (data.routes[i].is_active === false) {
      		inactiveArr.push(data.routes[i].long_name + " or " + data.routes[i].short_name)
       }
      }
      msg.channel.send("Active buses: ")
      msg.channel.send(arr)
      msg.channel.send("Inactive buses: ")
      msg.channel.send(inactiveArr)},
      r => msg.channel.send('Cannot access weather'))
  }

  else if(msg.content === 'movingbuses!') {
    fetch("https://api.devhub.virginia.edu/v1/transit/vehicles").then(r => r.json()).then(data => {
      var arr = [];
      for (const vehicle in data["vehicles"]) {
        if (data["vehicles"][vehicle]["speed"] > 0) {
          //fetch("https://api.devhub.virginia.edu/v1/transit/routes").then(r => r.json()).then(routesData => {
            //for (const route in routesData["routes"]) {
              //if (data["vehicles"][vehicle]["route_id"] === routesData["routes"][route]["id"]) {
                //arr.push(routesData["routes"][route][short_name])
              //}
            //}
            //},
          //r => msg.channel.send('Cannot access weather'))
      		arr.push(data["vehicles"][vehicle]["call_name"])
          }
      }
      msg.channel.send("Moving buses: ")
      msg.channel.send(arr)},
      r => msg.channel.send('Cannot access weather'))
  }

  else if(msg.content === '29Nstops!') {
    fetch("https://api.devhub.virginia.edu/v1/transit/bus-stops").then(r => r.json()).then(data => {
      var idArr = [];
      var stopArr = [];
      for (let i = 0; i < data.routes[0].stops.length; i++) {
        idArr.push(data.routes[0].stops[i])
      }
      msg.channel.send("List of all 29N Stops: ");
      msg.channel.send(stopArr);
      },
      r => msg.channel.send('Cannot access weather'))
  }

  else if(msg.content === 'What is the weather?'){
    fetch("https://api.weatherbit.io/v2.0/current?city=Charlottesville,VA&key=932b1f06a2164b0ea1b137d62b1eee51&include=minutely").then(r => r.json()).then(data => {
      msg.channel.send(data.data[0].weather.description)},
      r => msg.channel.send('Cannot access weather'))
    }

  else if(msg.content === 'What is your favorite color?')
      msg.channel.send('My favorite color is blue.')

  else if(msg.content === 'Tell me about yourself')
      msg.channel.send('My name is Arash Azizi. My favorite food is chocolate and my favorite football team is the Eagles.')
}

// Behavior independent of messages goes here.
// Function executed every 5 seconds.
var time = 0;
function onInterval(Client) {
    // There's some interesting syntax going on here but your code goes inside the inner curly braces.
    return async () => {
        time += 5;
        console.log('Executed interval.');
        //Bot.sendMessage("First");
            //fetch("https://api.devhub.virginia.edu/v1/transit/vehicles").then(r => r.json()).then(data => {
            //for (let x = 0; x < data.vehicles.length; x++) {
              //if (data.vehicles[x].route_id === 4013970) {
                //if (data.vehciles[x].next_stop === 4245904) {
                  //Bot.sendMessage("Your buses is close to your stop")
                //}
              //}
            //}
            //r => Bot.sendMessage('Cannot access your bus data')
            //}
          //)
        fetch("https://api.devhub.virginia.edu/v1/transit/vehicles").then(r => r.json()).then(data => {
          let userStop = 4235134;
          for (const dataField in data["vehicles"]) {
            //console.log(data["vehicles"][dataField]["call_name"])
            if (data["vehicles"][dataField]["current_stop_id"] === userStop) {
              Bot.sendMessage("Bus is at your stop!");
            }
          }
          },
          r => Bot.sendMessage('Cannot access Bus Information'))
        //Bot.sendMessage("First");

        fetch("https://api.devhub.virginia.edu/v1/transit/vehicles").then(r => r.json()).then(data => {
          let userStop = 4235134;
          for (const dataField in data["vehicles"]) {
            //console.log(data["vehicles"][dataField]["id"])
            if (data["vehicles"][dataField]["next_stop"] === userStop) {
              Bot.sendMessage("Bus will be at your stop soon!");
            }
          }
          },
          r => Bot.sendMessage('Cannot access Bus Information'))
        //Bot.sendMessage("Second");
  }
}
// Requires Nodejs v14.6.0
// Runs only if this file is the main process.
if(require.main === module) {
    BotLogin();
    Bot.on('message', msg => {
        // Ignore messages from other bots
        // Ignore messages from other channels
        if(msg.author.bot || msg.channel.id !== CHANNEL) return;
        onMessage(msg);
    });

    setInterval(onInterval(Bot), 5000);
}

module.exports = {
    Bot: Bot,
    Interval: onInterval,
}

fetch("https://api.weatherbit.io/v2.0/current?city=Charlottesville,VA&key=932b1f06a2164b0ea1b137d62b1eee51&include=minutely").then(r => r.json()).then(data => {
  let weatherReport = data.data[0].weather.description;
})
