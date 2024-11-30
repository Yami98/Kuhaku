const { Client, Interaction, ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');
const { v2 } = require('osu-api-extended');
const UserLink = require('../../models/OsuLink');  // Import the model

module.exports = {
    /**
     * 
     * @param {Client} client
     * @param {Interaction} interaction
     * 
     */
    callback: async (client, interaction) => {
        await interaction.deferReply();
        const nickname = interaction.options.get('nickname').value;

        try {
            // Get osu! user details using osu! API
            const dataOsuUser = await v2.users.details( {user: `${nickname}`});

            // Check if the user already exists in the database
            const existingUser = await UserLink.findOne({ discordID: interaction.user.id });

            if (existingUser) {
                // Update existing user's osu! data
                existingUser.osuUsername = dataOsuUser.username;
                existingUser.osuID = dataOsuUser.id;
                await existingUser.save();
                const updateData = new EmbedBuilder()
                    .setColor(0x18e1ee)
                    .setDescription(`Updated your osu! username to: ${dataOsuUser.username} (osu! ID: ${dataOsuUser.id})`);
                await interaction.editReply({
                    embeds: [updateData],
                });
            } else {
                // Create a new record for the user
                const newUser = new UserLink({
                    discordID: interaction.user.id,
                    osuUsername: dataOsuUser.username,
                    osuID: dataOsuUser.id,
                });
                await newUser.save();
                //await interaction.editReply(`Successfully linked your Discord account with osu! username: ${dataOsuUser.username} (osu! ID: ${dataOsuUser.id})`);
                const embedNoData = new EmbedBuilder()
                    .setColor(0x18e1ee)
                    .setDescription(`Successfully linked your Discord account with osu! username: ${dataOsuUser.username}`);
                await interaction.editReply({
                    embeds: [embedNoData],
                });
            }   

        } catch (error) {
            console.log(`Error on linking: ${error}`);
            await interaction.editReply('An error occurred while trying to link your osu! account.');
        }
    },
    name: 'osu-link',
    description: 'Link your Discord ID with your osu! username.',
    options: [
        {
            name: 'nickname',
            description: 'Your osu! IGN or UID.',
            required: true,
            type: ApplicationCommandOptionType.String,
        },
    ],
};
