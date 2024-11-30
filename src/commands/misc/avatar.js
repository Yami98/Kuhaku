const { Client, Interaction, ApplicationCommandOptionType } = require('discord.js');

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
            const user = interaction.options.get('target-user').user;
            const targetUser = await interaction.guild.members.fetch(user);
            const avatarURL = targetUser.user.avatarURL({ dynamic: true }) || targetUser.user.defaultAvatarURL;

            await interaction.editReply(`${avatarURL}`);
        } catch (error) {
            console.log(`Error on picking discord avatar: ${error}`);
        }
    },
    name: 'discord-avatar',
    description: `Get discord avatar in the server!`,
    options: [
        {
            name: 'target-user',
            description: 'Pick a member to get the avatar!.',
            required: true,
            type: ApplicationCommandOptionType.Mentionable,
        },
    ],
};