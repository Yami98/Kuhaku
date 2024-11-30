const { Client, Interaction, ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');
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

        try {
            // Check if the user exists in the database
            const existingUser = await UserLink.findOne({ discordID: interaction.user.id });

            if (existingUser) {
                // Delete the user from the database
                await UserLink.deleteOne({ discordID: interaction.user.id });
                const embed = new EmbedBuilder()
                    .setColor(0x18e1ee)
                    .setDescription(`Your osu! account link has been successfully removed.`);
                await interaction.editReply({
                    embeds: [embed],
                });
            } else {
                // If the user doesn't have a linked account
                const embedNoData = new EmbedBuilder()
                    .setColor(0x18e1ee)
                    .setDescription(`No osu! account link found for your Discord ID.`);
                await interaction.editReply({
                    embeds: [embedNoData],
                });
            }

        } catch (error) {
            console.log(`Error on unlinking: ${error}`);
            await interaction.editReply('An error occurred while trying to unlink your osu! account.');
        }
    },
    name: 'osu-unlink',
    description: 'Unlink your Discord ID from your osu! account.',
};
