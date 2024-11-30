const {
  Client,
  Interaction,
  ApplicationCommandOptionType,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const { v2, tools } = require("osu-api-extended");
const moment = require("moment");
const OsuLink = require("../../models/OsuLink");
const rosu = require("rosu-pp-js");
const axios = require("axios");
const num_codes = require("../../models/enum");
const calculateAccuracy = require("../../models/calculateAcc");
const requestReplay = require("../../models/replay");
const downloadReplay = require("../../models/downloadReplay");
const { comments } = require("osu-api-extended/dist/routes/v2");

module.exports = {
  /**
   *
   * @param {Client} client
   * @param {Interaction} interaction
   *
   */

  callback: async (client, interaction) => {
    await interaction.deferReply();
    const nickname = interaction.options.get("nickname")?.value;
    try {
      let dataOsuUser;

      if (nickname) {
        // If nickname is provided, fetch osu! user details using the nickname
        dataOsuUser = await v2.users.details({
          user: `${nickname}`,
        });
      } else {
        // If no nickname is provided, fetch osu! ID from MongoDB using Discord ID
        const linkedUser = await OsuLink.findOne({
          discordID: interaction.user.id,
        });

        if (!linkedUser) {
          await interaction.editReply(
            "You have not linked your osu! account yet. Please use the `/osu-link` command."
          );
          return;
        }

        // Fetch osu! user details using the stored osu! ID
        dataOsuUser = await v2.users.details({
          user: linkedUser.osuID,
        });
      }

      const dataOsu = await v2.scores.list({
        type: "user_recent",
        user_id: dataOsuUser.id,
        limit: 1,
      });
      console.log(dataOsu[0].statistics)
      const scoreid = await v2.scores.details({
        id: dataOsu[0].id,
      });

      function modsToNumber(mods) {
        let result = 0;

        for (const mod of mods) {
          if (mod !== "CL") {
            // Skip 'CL' mod
            const code = Object.values(num_codes).findIndex((m) => m === mod);
            if (code !== -1) {
              result += Math.pow(2, code);
            }
          }
        }

        return result;
      }

      if (dataOsu.length > 0) {
        const meh = dataOsu[0].statistics.meh || 0;
        const miss = dataOsu[0].statistics.miss || 0;
        const beatmap = await v2.beatmaps.details({
          type: "difficulty",
          id: dataOsu[0].beatmap_id,
        });
        let array = dataOsu[0].mods; //it broke rn... waiting to fix
        let acronyms = array.map((obj) => obj.acronym);
        let Mods = acronyms.join("");

        let modsArray = acronyms; // replace with your actual mods array
        let modsID = modsToNumber(modsArray);

        let CurentCombo = dataOsu[0].max_combo;
        let CC = Number(CurentCombo).toLocaleString();

        let MaxCombo = beatmap.max_combo;
        let MC = Number(MaxCombo).toLocaleString();

        const beatmapResponse = await axios.get(
          `https://osu.ppy.sh/osu/${dataOsu[0].beatmap_id}`,
          {
            responseType: "arraybuffer", // Ensures the response is in the correct format
          }
        );

        const bytes = beatmapResponse.data;

        let map = new rosu.Beatmap(bytes);

        const maxPP = new rosu.Performance({
          mods: modsID,
        }).calculate(map);

        // Calculate PP for the recent play
        const pp = new rosu.Performance({
          beatmap,
          combo: dataOsu[0].statistics.max_combo,
          misses: dataOsu[0].statistics.miss,
          accuracy: dataOsu[0].accuracy * 100, // Accuracy should be multiplied to get percentage
          mods: modsID,
        }).calculate(maxPP);

        let n300 =
          beatmap.count_circles +
          beatmap.count_sliders +
          beatmap.count_spinners;
          
        const numberOf300s =
          n300 - (dataOsu[0].statistics.ok + miss);
        const numberOf100s =
          dataOsu[0].statistics.ok + miss;
        const numberOf50s = 0;
        const totalHitObjects = numberOf300s + numberOf100s;

        const accuracyIfFc = calculateAccuracy(
          numberOf300s,
          numberOf100s,
          numberOf50s,
          totalHitObjects
        );

        const ppFC = new rosu.Performance({
          beatmap,
          combo: beatmap.max_combo,
          misses: 0,
          accuracy: accuracyIfFc, // Accuracy should be multiplied to get percentage
          mods: modsID,
        }).calculate(maxPP);

        let data = `${dataOsu[0].rank}`; // your data
        let gradeOutput;

        switch (data) {
          case "XH":
            gradeOutput = "<:XH:1208095312850194432>";
            break;
          case "X":
            gradeOutput = "<:X_:1208095315211718656>";
            break;
          case "SH":
            gradeOutput = "<:SH:1208095308681187418>";
            break;
          case "S":
            gradeOutput = "<:S_:1208095310555910144>";
            break;
          case "A":
            gradeOutput = "<:A_:1208095300019818656>";
            break;
          case "B":
            gradeOutput = "<:A_:1208095300019818656>";
            break;
          case "C":
            gradeOutput = "<:A_:1208095300019818656>";
            break;
          case "D":
            gradeOutput = "<:D_:1208095306063814687>";
            break;
          case "F":
            gradeOutput = "<:D_:1208095306063814687>";
            break;
        }

        let Score = `${dataOsu[0].legacy_total_score}`;
        let osuS = Number(Score).toLocaleString();

        let decimal = dataOsu[0].accuracy;
        let osuA = Math.floor(decimal * 10000) / 100 + "%";

        let hit = dataOsu[0].statistics.great;
        let great = Number(hit).toLocaleString();

        let date = new Date(`${dataOsu[0].ended_at}`);
        let unixTimestamp = Math.floor(date.getTime() / 1000);

        let Pass = dataOsu[0].passed;

        const totalSeconds = dataOsu[0].beatmap.total_length;
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        // Use String.padStart to ensure the seconds have at least two digits
        const formattedSeconds = String(seconds).padStart(2, "0");
        const formattedTime = `${minutes}:${formattedSeconds}`;

        if (dataOsu && dataOsu.length > 0) {
          try {
            const embedTrue = new EmbedBuilder()
              .setColor(0x18e1ee)
              .setImage(`${dataOsu[0].beatmapset.covers.cover}`)
              .setFooter({
                text: `Mapped by ${
                  dataOsu[0].beatmapset.creator
                } • ${dataOsu[0].beatmapset.status
                  .charAt(0)
                  .toUpperCase()}${dataOsu[0].beatmapset.status.slice(1)}`,
                iconURL: `${dataOsu[0].beatmapset.covers.cover}`,
              })
              .setAuthor({
                name: `${dataOsuUser.username}'s Recent Play`,
                iconURL: `https://osu.ppy.sh/images/flags/${dataOsuUser.country_code}.png`,
                url: `https://osu.ppy.sh/u/${dataOsuUser.id}/`,
              })
              .setTitle(
                `${dataOsu[0].beatmapset.artist} - ${dataOsu[0].beatmapset.title} [${dataOsu[0].beatmap.version}] [${dataOsu[0].beatmap.difficulty_rating}★] <t:${unixTimestamp}:R>`
              )
              .setURL(`${dataOsu[0].beatmap.url}`)
              .addFields([
                {
                  name: "Grade",
                  value: Pass // Replace with your actual condition
                    ? `${gradeOutput} + ${Mods}` // If condition is true
                    : `<:D_:1208095306063814687> + ${Mods}`, // If condition is false
                  inline: true,
                },
                {
                  name: "Score",
                  value: `${osuS}`,
                  inline: true,
                },
                {
                  name: "Accuracy",
                  value: `${osuA}`,
                  inline: true,
                },
                {
                  name: "PP",
                  value: `**${dataOsu[0].pp ? dataOsu[0].pp.toFixed(2) : 0}pp**/${maxPP.pp ? maxPP.pp.toFixed(2) : 0}pp`,
                  inline: true,
                },
                {
                  name: "Combo",
                  value: `**${CC}x**/${MC}x`,
                  inline: true,
                },
                {
                  name: "Hits",
                  value: `(${great}/${dataOsu[0].statistics.ok}/${meh}/${miss})`,
                  inline: true,
                },
                {
                  name: "If FC: PP",
                  value: `**${ppFC.pp ? ppFC.pp.toFixed(2) : 0}pp**/${maxPP.pp ? maxPP.pp.toFixed(2) : 0}pp`,
                  inline: true,
                },
                {
                  name: "Accuracy",
                  value: `${accuracyIfFc.toFixed(2)}%`,
                  inline: true,
                },
                {
                  name: "Hits",
                  value: `(${numberOf300s}/${numberOf100s}/${numberOf50s}/0)`,
                  inline: true,
                },
                {
                  name: "Map Info",
                  value: `Mapper: \`${dataOsu[0].beatmapset.creator}\` Length: \`${formattedTime}\` BPM: \`${dataOsu[0].beatmap.bpm}\`
                                    CS: \`${dataOsu[0].beatmap.cs}\` AR: \`${dataOsu[0].beatmap.ar}\` OD: \`${dataOsu[0].beatmap.accuracy}\` HP: \`${dataOsu[0].beatmap.drain}\``,
                  inline: false,
                },
              ]);
            
              // Create an array to hold the action rows (buttons)
              // Check if the osu! score has a replay available
             
                
                // If replay is not available, send nothing (empty components)
                await interaction.editReply({
                  embeds: [embedTrue], // You can send only the embed or remove it if not needed
                  components: [], // No buttons
                });
            return;

          } catch (error) {
            const errore = new EmbedBuilder()
              .setColor(0x18e1ee)
              .setDescription(`Error on true :${error}`);
            await interaction.editReply({
              embeds: [errore],
            });
            console.log(`Error on true :${error}`);
          }
        }
      } else {
        const embedNoData = new EmbedBuilder()
          .setColor(0x18e1ee)
          .setDescription(`${dataOsuUser.username} don't have recent play...`);
        await interaction.editReply({
          embeds: [embedNoData],
        });
      }
    } catch (error) {
      console.log(error);
      //await interaction.editReply(`An error occurred while fetching the osu! profile. ${error}`);
      const embedNoData = new EmbedBuilder()
        .setColor(0x18e1ee)
        .setDescription(
          `An error occurred while fetching the osu! recent play.`
        );
      await interaction.editReply({
        embeds: [embedNoData],
      });
    }
    
  },
  

  name: "rs",
  description: "Detail osu! recent play",
  global: true,
  options: [
    {
      name: "nickname",
      description: "You can use your osu IGN or UID.",
      required: false,
      type: ApplicationCommandOptionType.String,
    },
  ],
};
