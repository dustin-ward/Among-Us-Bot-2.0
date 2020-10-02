const fs = require("fs");

var methods = {};
methods.removeQueue = (guild, client) => {
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

        if(serverData.servers[serverIdx].queue != "") {
            // guild.client.channels.fetch(serverData.servers[serverIdx].queue).then(ch => {
            //     ch.parent.delete();
            //     ch.delete();
            // })
            // .catch(console.error);
            const ch = await guild.client.channels.fetch(serverData.servers[serverIdx].queue);
            ch.parent.delete();
            ch.delete();
            console.log("EMPTY QUEUE");
            serverData.servers[serverIdx].queue = "";
        }

        fs.writeFile('./serverData.json', JSON.stringify(serverData, null, 4), (err) => { 
            if(err) throw err;
            methods.removeLobbies(guild, client); 
        });
    });
}

methods.removeLobbies = (guild, client) => {
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
            client.channels.fetch(channel.voice).then(ch => {ch.delete()}).catch(console.error);
            client.channels.fetch(channel.generalText).then(ch => {ch.delete()}).catch(console.error);
            client.channels.fetch(channel.queueText).then(ch => {ch.delete()}).catch(console.error);
            client.channels.fetch(channel.category).then(ch => {ch.delete()}).catch(console.error);
        });

        serverData.servers[serverIdx].lobbies = [];

        fs.writeFile('./serverData.json', JSON.stringify(serverData, null, 4), (err) => { if(err) throw err; });
    });
}

methods.setupQueue = (guild, numLobbies) => {
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

        methods.removeQueue(guild, guild.client);

        const _category = await guild.channels.create("JOIN QUEUE HERE", {type: 'category'});
        const _queue = await guild.channels.create("queue", {type: 'text', parent: _category});
        console.log("SETTING QUEUE");
        serverData.servers[serverIdx].queue = _queue.id;
        console.log(serverData.servers[serverIdx].queue);

        fs.writeFile('./serverData.json', JSON.stringify(serverData, null, 4), (err) => { 
            if(err) throw err; 
            methods.setupLobbies(guild, numLobbies);
        });
    });
}

methods.setupLobbies = (guild, numLobbies) => {
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

        methods.removeLobbies(guild, guild.client);

        for(let i=1; i<=numLobbies; i++) {
            const _category = await guild.channels.create("Lobby " + i, {type: 'category'});
            const _queueText = await guild.channels.create("lobby-" + i + "-info", {type: 'text', parent: _category});
            const _generalText = await guild.channels.create("lobby-" + i + "-chat", {type: 'text', parent: _category});
            const _voice = await guild.channels.create("Lobby " + i + " Voice", {type: 'voice', parent: _category, userLimit: 10});
            let lobby = {
                category: _category.id,
                queueText: _queueText.id,
                generalText: _generalText.id,
                voice: _voice.id
            };
            
            serverData.servers[serverIdx].lobbies.push(lobby);
    
            console.log("Lobby " + i + " created");
        }
        console.log("IN LOBBY: " + serverData.servers[serverIdx.queue]);
        fs.writeFile('./serverData.json', JSON.stringify(serverData, null, 4), (err) => { if(err) throw err; });
    });
}

module.exports = methods;