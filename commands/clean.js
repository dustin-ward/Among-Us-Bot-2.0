const fs = require("fs");
const channelManager = require('../src/channelManager.js');

module.exports = {
    name: 'clean',
    description: 'Delete all lobby channels from server and db',
    execute(message, args) {
        let guild = message.guild;
        let client = message.client;
        channelManager.removeQueue(guild, client);
    }
};