const { 
    Client, 
    Interaction, 
    ApplicationCommandOptionType,
    EmbedBuilder 
} = require('discord.js');

module.exports = {
    /**
     * 
     * @param {Client} client
     * @param {Interaction} interaction
     * 
     */
    callback: async (client, interaction) => {
        await interaction.deferReply();

        // Get the voice channel to delete
        const channel = interaction.options.get('channel')?.channel;

        if (!channel || channel.type !== 2) {
            return await interaction.editReply('Please select a valid voice channel.');
        }

        try {
            // Check if the bot has permission to manage channels
            if (!interaction.guild.members.me.permissions.has('MANAGE_CHANNELS')) {
                return await interaction.editReply('I do not have permission to delete channels.');
            }

            // Delete the channel
            await channel.delete();
            const suc = new EmbedBuilder()
                .setColor(0x18e1ee)
                .setDescription(`Voice channel "${channel.name}" has been deleted!`);
            await interaction.editReply({
            embeds: [suc],
            });
        } catch (error) {
            console.log(`Error: ${error}`);
            await interaction.editReply('An error occurred while trying to delete the voice channel.');
        }
    },
    name: 'delete-vc',
    description: 'Delete an existing voice channel',
    options: [
        {
            name: 'channel',
            description: 'The voice channel to delete',
            required: true,
            type: ApplicationCommandOptionType.Channel,
        },
    ],
};
