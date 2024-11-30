const {
  Client,
  Interaction,
  ApplicationCommandOptionType,
  EmbedBuilder,
} = require("discord.js");
const { v2 } = require("osu-api-extended");
const moment = require("moment");
const OsuLink = require("../../models/OsuLink"); // MongoDB model

module.exports = {
  /**
   * Command callback function
   * @param {Client} client - The Discord client instance
   * @param {Interaction} interaction - The interaction object
   */
  callback: async (client, interaction) => {
    await interaction.deferReply();

    const nickname = interaction.options.get("nickname")?.value;

    try {
      let dataOsu;

      if (nickname) {
        // Fetch osu! user details using the provided nickname
        dataOsu = await v2.users.details({ user: `${nickname}` });
      } else {
        // Retrieve linked osu! ID from MongoDB using Discord ID
        const linkedUser = await OsuLink.findOne({ discordID: interaction.user.id });

        if (!linkedUser) {
          await interaction.editReply(
            "You have not linked your osu! account yet. Please use the `/osu-link` command."
          );
          return;
        }

        // Fetch osu! user details using the linked osu! ID
        dataOsu = await v2.users.details({ user: linkedUser.osuID });
      }

      // Parse osu! data into readable formats
      const osuData = {
        peakRank: Number(dataOsu.rank_highest.rank).toLocaleString(),
        globalRank: Number(dataOsu.statistics.global_rank).toLocaleString(),
        localRank: Number(dataOsu.statistics.country_rank).toLocaleString(),
        totalPP: Number(dataOsu.statistics.pp).toLocaleString(),
        totalScore: Number(dataOsu.statistics.total_score).toLocaleString(),
        totalHits: Number(dataOsu.statistics.total_hits).toLocaleString(),
        rankedScore: Number(dataOsu.statistics.ranked_score).toLocaleString(),
        maxCombo: Number(dataOsu.statistics.maximum_combo).toLocaleString(),
        accuracy: (Math.round(dataOsu.statistics.hit_accuracy * 10) / 10).toFixed(1),
        playCount: Number(dataOsu.statistics.play_count).toLocaleString(),
        playTime: Math.floor(dataOsu.statistics.play_time / 3600).toLocaleString(),
        replaysWatched: Number(dataOsu.statistics.replays_watched_by_others).toLocaleString(),
        medals: dataOsu.user_achievements.length,
        level: `${dataOsu.statistics.level.current}.${dataOsu.statistics.level.progress}`,
        grades: {
          ssh: Number(dataOsu.statistics.grade_counts.ssh).toLocaleString(),
          ss: Number(dataOsu.statistics.grade_counts.ss).toLocaleString(),
          sh: Number(dataOsu.statistics.grade_counts.sh).toLocaleString(),
          s: Number(dataOsu.statistics.grade_counts.s).toLocaleString(),
          a: Number(dataOsu.statistics.grade_counts.a).toLocaleString(),
        },
        joinDate: moment(dataOsu.join_date).utc().format("HH:mm:ss DD MMM YYYY"),
        yearsAgo: moment().diff(moment(dataOsu.join_date), "years"),
      };

      // Build the embed message
      const embed = new EmbedBuilder()
        .setColor(0x18e1ee)
        .setImage(dataOsu.cover_url)
        .setThumbnail(`https://a.ppy.sh/${dataOsu.id}`)
        .setFooter({
          text: `Joined osu! at ${osuData.joinDate} (${osuData.yearsAgo} years ago)`,
          iconURL: `https://a.ppy.sh/${dataOsu.id}`,
        })
        .setAuthor({
          name: `${dataOsu.username}'s Profile`,
          iconURL: `https://osu.ppy.sh/images/flags/${dataOsu.country_code}.png`,
          url: `https://osu.ppy.sh/u/${dataOsu.id}`,
        })
        .addFields([
          { name: "Peak Rank", value: `#${osuData.peakRank}`, inline: true },
          { name: "Current Rank", value: `#${osuData.globalRank} (${dataOsu.country_code}#${osuData.localRank})`, inline: true },
          { name: "Level", value: osuData.level, inline: true },
          { name: "Total PP", value: `${osuData.totalPP}pp`, inline: true },
          { name: "Total Score", value: osuData.totalScore, inline: true },
          { name: "Total Hits", value: osuData.totalHits, inline: true },
          { name: "Ranked Score", value: osuData.rankedScore, inline: true },
          { name: "Max Combo", value: osuData.maxCombo, inline: true },
          { name: "Accuracy", value: `${osuData.accuracy}%`, inline: true },
          {
            name: "Grades",
            value: `<:XH:1208095312850194432>${osuData.grades.ssh} <:X_:1208095315211718656>${osuData.grades.ss} <:SH:1208095308681187418>${osuData.grades.sh} <:S_:1208095310555910144>${osuData.grades.s} <:A_:1208095300019818656>${osuData.grades.a}`,
            inline: false,
          },
          { name: "Play Count", value: `${osuData.playCount} / ${osuData.playTime} hrs`, inline: true },
          { name: "Medals", value: `${osuData.medals}`, inline: true },
        ]);

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      await interaction.editReply("An error occurred while fetching the osu! profile.");
    }
  },

  name: "osu",
  description: "View osu! profile details",
  global: true,
  options: [
    {
      name: "nickname",
      description: "Your osu! username or UID (optional).",
      required: false,
      type: ApplicationCommandOptionType.String,
    },
  ],
};
