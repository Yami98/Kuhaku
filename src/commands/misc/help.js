const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "help",
  description: "If you have trouble using Kuhaku Bot!",
  // devOnly: Boolean,
  //testOnly: true,
  // options: Object[],
  // deleted: Boolean,

  callback: async (client, interaction) => {
    const embed = new EmbedBuilder()
      .setTitle("Help Menu")
      .setDescription(
        `Some usefull information that you can use ${interaction.user}`
      )
      .setColor(0x18e1ee)
      .setThumbnail(interaction.user.displayAvatarURL())
      .setTimestamp(Date.now())
      .setAuthor({
        name: interaction.user.tag,
        iconURL: interaction.user.displayAvatarURL(),
        url: `https://discordapp.com/users/${interaction.user.id}/`,
      })
      .addFields([
        {
          name: "Base Command",
          value: `</about:0>, </help:0>, </discord-avatar:0>`,
          inline: true,
        },
        {
          name: "Moderation",
          value: `</ban:0>, </timeout:0>, </kick:0>`,
          inline: false,
        },
        {
          name: "osu!",
          value: `</profile:0>, </rs:0>, </mp:0>`,
          inline: false,
        },
        {
          name: "Miscellaneous",
          value: `Comming Soon`,
          inline: false,
        },
      ]);

    await interaction.reply({
      embeds: [embed],
    });
  },
};
