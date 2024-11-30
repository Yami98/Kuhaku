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

        // Get the channel name and parent category from the user's input
        const channelName = interaction.options.get('channel_name')?.value;
        const parentChannel = interaction.options.get('parent')?.channel;

        if (!channelName) {
            return await interaction.editReply('Please provide a valid channel name.');
        }

        if (!parentChannel || parentChannel.type !== 4) { // 4 is for category channels
            return await interaction.editReply('Please select a valid category channel.');
        }

        try {
            // Check if the bot has permission to create channels
            if (!interaction.guild.members.me.permissions.has('MANAGE_CHANNELS')) {
                return await interaction.editReply('I do not have permission to create channels.');
            }

            // Create a new voice channel under the specified parent (category)
            const newChannel = await interaction.guild.channels.create({
                name: channelName,
                type: 2, // Voice channel type
                parent: parentChannel.id, // Set the category as the parent
            });

            // Confirm the creation
            const suc = new EmbedBuilder()
                .setColor(0x18e1ee)
                .setDescription(`Voice channel "${newChannel.name}" has been created under the ${parentChannel.name} category!`);
            await interaction.editReply({
            embeds: [suc],
            });
            await interaction.editReply(``);
        } catch (error) {
            console.log(`Error: ${error}`);
            const err = new EmbedBuilder()
                .setColor(0x18e1ee)
                .setDescription(`An error occurred while trying to create the voice channel.`);
            await interaction.editReply({
            embeds: [err],
            });
        }
    },
    name: 'create-vc',
    description: 'Create a new voice channel in a specific category',
    options: [
        {
            name: 'channel_name',
            description: 'The name of the voice channel to create',
            required: true,
            type: ApplicationCommandOptionType.String,
        },
        {
            name: 'parent',
            description: 'The category where the voice channel should be created',
            required: true,
            type: ApplicationCommandOptionType.Channel,
        },
    ],
};
