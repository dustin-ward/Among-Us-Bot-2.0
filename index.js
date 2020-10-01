const Discord = require("discord.js");
const fs = require("fs");
const { type } = require("os");
const { getHeapCodeStatistics } = require("v8");
const config = require("./config.json");

const client = new Discord.Client();

clearServerChannels = (guild) => {
    fs.readFile('./serverData.json', async(err, data) => {
        if(err) throw err;
        console.log("serverData succesfully read");

        let serverData = JSON.parse(data);
        for(i in serverData.servers) {
            if(serverData.servers[i].id === guild.id) {
                var serverIdx = i;
                break;
            }
        }

        serverData.servers[serverIdx].lobbies.forEach(channel => {
            client.channels.fetch(channel.voice.id).then(ch => {ch.delete()}).catch(console.error);
            client.channels.fetch(channel.generalText.id).then(ch => {ch.delete()}).catch(console.error);
            client.channels.fetch(channel.queueText.id).then(ch => {ch.delete()}).catch(console.error);
            client.channels.fetch(channel.category.id).then(ch => {ch.delete()}).catch(console.error);
        });

        serverData.servers[serverIdx].lobbies = [];

        fs.writeFile('./serverData.json', JSON.stringify(serverData, null, 4), (err) => { if(err) throw err; });
    });
}

setupServerChannels = (guild, numLobbies) => {
    fs.readFile('./serverData.json', async(err, data) => {
        if(err) throw err;
        console.log("serverData succesfully read");

        let serverData = JSON.parse(data);
        for(i in serverData.servers) {
            if(serverData.servers[i].id === guild.id) {
                var serverIdx = i;
                break;
            }
        }

        clearServerChannels(guild);

        for(let i=1; i<=numLobbies; i++) {
            const _category = await guild.channels.create("Lobby " + i, {type: 'category'});
            const _queueText = await guild.channels.create("lobby-" + i + "-info", {type: 'text', parent: _category});
            const _generalText = await guild.channels.create("lobby-" + i + "-chat", {type: 'text', parent: _category});
            const _voice = await guild.channels.create("Lobby " + i + " Voice", {type: 'voice', parent: _category, userLimit: 10});
            let lobby = {
                category: _category,
                queueText: _queueText,
                generalText: _generalText,
                voice: _voice
            };
            
            serverData.servers[serverIdx].lobbies.push(lobby);
    
            console.log("Lobby " + i + " created");
        }

        fs.writeFile('./serverData.json', JSON.stringify(serverData, null, 4), (err) => { if(err) throw err; });
    });
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
            serverData.servers.push({id: guild.id, lobbies: []});
            fs.writeFile('./serverData.json', JSON.stringify(serverData, null, 4), (err) => { if(err) throw err; });
        }

        setupServerChannels(guild, 3);
    });
});

client.on("message", message => {
    if(message.content == 'setup') {
        setupServerChannels(message.guild, 3);
    }
    if(message.content == 'clean') {
        clearServerChannels(message.guild);
    }
});

client.on("messageReactionAdd", (reaction, user) => {

});

client.on("messageReactionRemove", (reaction, user) => {

});

client.login(config.token);