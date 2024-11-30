const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'ping',
  description: 'Pong!',
  // devOnly: Boolean,
  //testOnly: true,
  // options: Object[],
  // deleted: Boolean,

  callback: async (client, interaction) => {
    await interaction.deferReply();

    const reply = await interaction.fetchReply();

    const ping = reply.createdTimestamp - interaction.createdTimestamp;

    const embedData = new EmbedBuilder()
        .setColor(0x18e1ee)
        .setDescription(`Client: ${ping}ms\nWebsocket: ${client.ws.ping}ms`);
    await interaction.editReply({
        embeds: [embedData],
    });
  },
};