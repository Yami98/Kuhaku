const { ActivityType } = require('discord.js');

module.exports = (client, interaction) => {
    const totalGuilds = client.guilds.cache.size; // Counts how many servers the bot is in

    console.log('Connected to the bot.');
    console.log(`Logged in as ${client.user.tag}!`);

    // Set the activity to show the total number of servers
    client.user.setActivity(
        `${totalGuilds} Guilds | /help`, {
        type: ActivityType.Watching,
        button: 'Test'
    });
};
