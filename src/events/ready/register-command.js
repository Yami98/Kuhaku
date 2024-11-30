const { testServer } = require('../../../config.json');
const areCommandsDifferent = require('../../utils/areCommandsDifferent');
const getLocalCommands = require('../../utils/getLocalCommands');

module.exports = async (client) => {
    try {
        const localCommands = getLocalCommands();

        // Separate commands into global and server-specific
        const globalCommands = localCommands.filter((cmd) => cmd.global);
        const serverCommands = localCommands.filter((cmd) => !cmd.global);

        // Register global commands
        if (globalCommands.length) {
            const applicationCommands = await client.application.commands.fetch();

            for (const localCommand of globalCommands) {
                const { name, description, options } = localCommand;

                const existingCommand = applicationCommands.find(
                    (cmd) => cmd.name === name
                );

                if (existingCommand) {
                    if (localCommand.deleted) {
                        await client.application.commands.delete(existingCommand.id);
                        console.log(`Deleted global command "${name}".`);
                        continue;
                    }

                    if (areCommandsDifferent(existingCommand, localCommand)) {
                        await client.application.commands.edit(existingCommand.id, {
                            description,
                            options,
                        });
                        console.log(`🔁 Edited global command "${name}".`);
                    }
                } else {
                    if (localCommand.deleted) {
                        console.log(
                            `⏩ Skipping registering global command "${name}" as it's set to delete.`
                        );
                        continue;
                    }

                    await client.application.commands.create({
                        name,
                        description,
                        options,
                    });
                    console.log(`🌍 Registered global command "${name}".`);
                }
            }
        }

        // Register server-specific commands for the test server
        if (serverCommands.length) {
            const guild = client.guilds.cache.get(testServer);

            if (!guild) {
                console.log(`Guild with ID "${testServer}" not found.`);
                return;
            }

            const applicationCommands = await guild.commands.fetch();

            for (const localCommand of serverCommands) {
                const { name, description, options } = localCommand;

                const existingCommand = applicationCommands.find(
                    (cmd) => cmd.name === name
                );

                if (existingCommand) {
                    if (localCommand.deleted) {
                        await guild.commands.delete(existingCommand.id);
                        console.log(`Deleted server-specific command "${name}" in test server.`);
                        continue;
                    }

                    if (areCommandsDifferent(existingCommand, localCommand)) {
                        await guild.commands.edit(existingCommand.id, {
                            description,
                            options,
                        });
                        console.log(`🔁 Edited server-specific command "${name}" in test server.`);
                    }
                } else {
                    if (localCommand.deleted) {
                        console.log(
                            `⏩ Skipping registering server-specific command "${name}" in test server as it's set to delete.`
                        );
                        continue;
                    }

                    await guild.commands.create({
                        name,
                        description,
                        options,
                    });
                    console.log(`🏠 Registered server-specific command "${name}" in test server.`);
                }
            }
        }
    } catch (error) {
        console.log(`There was an error: ${error}`);
    }
};
