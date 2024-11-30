const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "about",
  description: "About Kuhaku Bot!",
  // devOnly: Boolean,
  //testOnly: true,
  // options: Object[],
  // deleted: Boolean,

  callback: async (client, interaction) => {
    const embed = new EmbedBuilder()
      .setTitle("Kuhaku Bot")
      .setDescription(
        `Kuhaku bot is a project from  Kuhaku Team who have time to do wierd stuff`
      )
      .setColor(0x18e1ee)
      .setImage(
        "https://cdn.discordapp.com/attachments/548675026191253536/1048503100417249341/Long_Kuhaku.png"
      )
      .setThumbnail(client.user.displayAvatarURL())
      .setTimestamp(Date.now())
      .setAuthor({
        name: client.user.tag,
        iconURL: client.user.displayAvatarURL(),
        url: `https://discordapp.com/users/${client.user.id}/`,
      })
      .addFields([
        {
          name: "Miscellaneous",
          value: "Code Version: ``v0.5.2``",
          inline: true,
        },
        {
          name: "Developers",
          value:
            "Lead: <@217582472613986304> \n Dev & Graphic: <@546651020109938697>",
          inline: false,
        },
      ]);

    await interaction.reply({
      embeds: [embed],
    });
  },
};
