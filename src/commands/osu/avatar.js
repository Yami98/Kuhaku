const { Client, Interaction, ApplicationCommandOptionType } = require('discord.js');
const { v2 } = require('osu-api-extended');
const OsuLink = require('../../models/OsuLink'); // MongoDB model

module.exports = {
    /**
     * 
     * @param {Client} client
     * @param {Interaction} interaction
     * 
     */
    callback: async (client, interaction) => {
        await interaction.deferReply();
        
        // Check if the user provided a nickname
        const nickname = interaction.options.get('nickname')?.value;

        try {
            let dataOsuUser;

            if (nickname) {
                // If nickname is provided, fetch osu! user details using the nickname
                dataOsuUser = await v2.user.details(nickname);
            } else {
                // If no nickname is provided, fetch osu! ID from MongoDB using Discord ID
                const linkedUser = await OsuLink.findOne({ discordID: interaction.user.id });

                if (!linkedUser) {
                    await interaction.editReply('You have not linked your osu! account yet. Please use the `/osu-link` command.');
                    return;
                }

                // Fetch osu! user details using the stored osu! ID
                dataOsuUser = await v2.user.details(linkedUser.osuID);
            }

            // Reply with osu! avatar URL
            await interaction.editReply(`https://a.ppy.sh/${dataOsuUser.id}`);
        } catch (error) {
            console.log(`Error: ${error}`);
            await interaction.editReply('An error occurred while trying to fetch the osu! avatar.');
        }
    },
    name: 'osu-avatar',
    description: 'Get osu! avatar!',
    options: [
        {
            name: 'nickname',
            description: 'Optionally provide your osu! IGN or UID.',
            required: false,
            type: ApplicationCommandOptionType.String,
        },
    ],
};
