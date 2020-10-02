const Discord = require("discord.js");
const fs = require("fs");
// const { type } = require("os");
// const { getHeapCodeStatistics } = require("v8");
const config = require("./config.json");
const channelManager = require('./src/channelManager.js');

const client = new Discord.Client();
client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

client.on("ready", () => {
    console.log(`Among Us Bot 2.0 is running in ${client.guilds.cache.size} servers`);
    client.user.setPresence({ activity: { type: 'WATCHING', name: "for " + config.prefix + "help" }, status: 'online' })
        .catch(console.error);
    // client.user.setPresence({ activity: { name: 'UNDER CONSTRUCTION' }, status: 'dnd' })
    //     .catch(console.error);
});

client.on("guildCreate", guild => {
    fs.readFile('./serverData.json', (err, data) => {
        if(err) throw err;
        let serverData = JSON.parse(data);
        
        let newServer = true;
        for(i in serverData.servers) {
            if(serverData.servers[i].id === guild.id) {
                newServer = false;
            }
        }

        if(newServer) {
            serverData.servers.push({id: guild.id, queue: null, lobbies: []});
            fs.writeFile('./serverData.json', JSON.stringify(serverData, null, 4), (err) => { if(err) throw err; });
        }
    
        channelManager.setupLobbies(guild, 3);
    });
});

client.on("message", message => {
    if (!message.content.startsWith(config.prefix) || message.author.bot) return;

	const args = message.content.slice(config.prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (!client.commands.has(command)) return;

    try {
        client.commands.get(command).execute(message, args);
    } 
    catch (error) {
        console.error(error);
        message.reply('there was an error trying to execute that command!');
    }
});

client.on("messageReactionAdd", (reaction, user) => {

});

client.on("messageReactionRemove", (reaction, user) => {

});

client.login(config.token);