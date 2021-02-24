require('dotenv').config();
const Bot = new (require('discord.js').Client)();
const axios = require('axios');

var TOKEN = process.env.DISCORDTOKEN;
var NAME = process.env.DISCORDNAME;
var CHANNEL = '812110847194693693'; // ID of the channel which this bot looks at

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
    if(msg.content === 'tell me about yourself'){
      msg.channel.send('Hi, my name is Serhii!'+
      ' I am a second year student and I study computer science.'+
      ' I like watching TV and playing computer games.');
    }
    if(msg.content === '!weather'){
      let getWeather = async () => {
        let response = await axios.get('http://api.openweathermap.org/data/2.5/weather?q=Charlottesville&appid=8c7aec8bcf09c0c9181b2258c865837c')
        let weather = response.data
        return weather
      }
      let weatherValue = await getWeather()
      msg.channel.send(`City: ${weatherValue['name']}. Temperature: ${weatherValue['main']['temp']} (absolute temperature in Kelvin).`+
    ` Weather description: ${weatherValue['weather']['0']['description']}`);
    }

}

// Behavior independent of messages goes here.
// Function executed every 5 seconds.
var time = 0;
function onInterval(Client) {
    // There's some interesting syntax going on here but your code goes inside the inner curly braces.
    return async () => {
        time += 5;
        console.log('Executed interval.');
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
