const { devs, testServer } = require('../../../config.json');
const getLocalCommands = require('../../utils/getLocalCommands');

module.exports = async (client, interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const localCommands = getLocalCommands();

    try {
        const commandObject = localCommands.find(
            (cmd) => cmd.name === interaction.commandName
        );

        if (!commandObject) return;

        // Developer-only check
        if (commandObject.devOnly) {
            const isDev = devs.includes(interaction.member.id);
            const isTestServer = interaction.guild.id === testServer;

            if (!isDev && !isTestServer) {
                interaction.reply({
                    content: 'Only developers or members in the test server are allowed to run this command.',
                    ephemeral: true,
                });
                return;
            }
        }

        // Test-only commands
        if (commandObject.testOnly) {
            if (interaction.guild.id !== testServer) {
                interaction.reply({
                    content: 'This command cannot be run here.',
                    ephemeral: true,
                });
                return;
            }
        }

        // Permission checks for users
        if (commandObject.permissionsRequired?.length) {
            for (const permission of commandObject.permissionsRequired) {
                if (!interaction.member.permissions.has(permission)) {
                    interaction.reply({
                        content: 'Not enough permissions.',
                        ephemeral: true,
                    });
                    return;
                }
            }
        }

        // Permission checks for bot
        if (commandObject.botPermissions?.length) {
            for (const permission of commandObject.botPermissions) {
                const bot = interaction.guild.members.me;

                if (!bot.permissions.has(permission)) {
                    interaction.reply({
                        content: "I don't have enough permissions.",
                        ephemeral: true,
                    });
                    return;
                }
            }
        }

        // Execute the command's callback
        await commandObject.callback(client, interaction);
    } catch (error) {
        console.log(`There was an error running this command: ${error}`);
    }
};
