const fs = require("fs");
const channelManager = require('../src/channelManager.js');

module.exports = {
    name: 'setup',
    description: 'Create and Store the required lobby channels',
    execute(message, args) {
        let guild = message.guild;
        let numLobbies = args[0];
        if(!(numLobbies > 0)) {
            message.channel.send("**ERROR: ** No argument supplied");
            return;
        }
        channelManager.setupQueue(guild, numLobbies);
        message.channel.send("**SUCCESS: ** " + numLobbies + " lobbies created");
    }
};