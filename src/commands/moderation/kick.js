const { Client, Interaction, ApplicationCommandOptionType, PermissionFlagsBits, } = require('discord.js');

module.exports = {
    /**
     * 
     * @param {Client} client
     * @param {Interaction} interaction
     * 
     */

    callback: async (client, interaction) => {
        const targetUserId = interaction.options.get('target-user').value;
        const reason = interaction.options.get('reason')?.value || 'No reason provided.';

        await interaction.deferReply();

        const targetUser = await interaction.guild.members.fetch(targetUserId);

        if (!targetUser) {
            await interaction.editReply('Could not find the specified user.');
            return;
        }

        if (targetUser.id === interaction.guild.ownerId) {
            await interaction.editReply('You cannot kick the server owner.');
            return;
        }

        const targetUserRolePosition = targetUser.roles.highest.position; // Highest role target user
        const requestUserRolePosition = interaction.member.roles.highest.position; // Highest role user running cmd
        const botRolePosition = interaction.guild.members.me.roles.highest.position;

        if (targetUserRolePosition >= requestUserRolePosition) {
            await interaction.editReply('You cannot kick a user with an equal or higher role than you.');
            return;
        }

        if (botRolePosition <= targetUserRolePosition) {
            await interaction.editReply('I cannot kick a user with an equal or higher role than me.');
            return;
        }

        //Ban User
        try {
            await targetUser.kick(
                reason
            );
            await interaction.editReply(
                `User ${targetUser} has been Kicked\n Reason: ${reason}`
            );
        } catch (error) {
            console.log(`There was an error when kicking: ${error}`)
        }
    },

    //deleted: true,
    name: 'kick',
    description: 'Kick a member...',
    // devOnly: Boolean,
    // testOnly: Boolean,
    options: [
        {
            name: 'target-user',
            description: 'The user to Kick.',
            required: true,
            type: ApplicationCommandOptionType.Mentionable,
        },
        {
            name: 'reason',
            description: 'The reason for kicking.',
            type: ApplicationCommandOptionType.String,
        },
    ],
    permissionsRequired: [PermissionFlagsBits.Administrator],
    botPermissions: [PermissionFlagsBits.Administrator],
};