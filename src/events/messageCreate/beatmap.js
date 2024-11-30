const {
  Client,
  Interaction,
  ApplicationCommandOptionType,
  EmbedBuilder,
  Message,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
} = require("discord.js");
const { v2, tools } = require("osu-api-extended");
const moment = require("moment");
const { MessageEmbed } = require("discord.js");
const rosu = require("rosu-pp-js");
const axios = require("axios");
const num_codes = require("../../models/enum");
const calculateAccuracy = require("../../models/calculateAcc");

/**
 *
 * @param {Client} client
 * @param {Interaction} interaction
 * @param {Message} message
 *
 */

module.exports = async (client, message, interaction) => {
  if (message.author.bot) {
    return;
  }
  if (message.content == "hello") {
    message.reply(`Hello, I'm emmu ottori, emmu is meaning SMILE!`);
  }
  const match = message.content.match(
    /^https:\/\/osu\.ppy\.sh\/beatmapsets\/(\d+)#\w+\/(\d+)\s?(\w+)?$/
  );

  if (match) {
    const beatmapsetId = match[1];
    const beatmapId = match[2];
    const modAcr = match[3]?.match(/.{1,2}/g) || ["CL"]; // Use "NoMod" if mod is not present
    //console.log(modAcr);
    const beatmap = await v2.beatmaps.details({
      type: "difficulty",
      id: beatmapId,});

      //console.log(beatmap);
    const dataOsuUser = await v2.users.details({
      user: `${beatmap.beatmapset.creator}`,
    });
    //console.log(beatmap.beatmapset.creator);
    let totalObject =
      beatmap.count_circles +
      beatmap.count_sliders +
      beatmap.count_spinners;

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
    // Example usage:
    let modsArray = modAcr;
    let modsID = modsToNumber(modsArray);
    //console.log(modsID);
    let Mods = modAcr.join("");
    //console.log(Mods);

    const beatmapResponse = await axios.get(
      `https://osu.ppy.sh/osu/${beatmapId}`,
      {
        responseType: "arraybuffer", // Ensures the response is in the correct format
      }
    );

    const bytes = beatmapResponse.data;

    let map = new rosu.Beatmap(bytes);

    const pp95 = new rosu.Performance({
      mods: modsID,
      accuracy: 95,
    }).calculate(map);

    const pp96 = new rosu.Performance({
      mods: modsID,
      accuracy: 96,
    }).calculate(map);

    const pp97 = new rosu.Performance({
      mods: modsID,
      accuracy: 97,
    }).calculate(map);

    const pp98 = new rosu.Performance({
      mods: modsID,
      accuracy: 98,
    }).calculate(map);

    const pp99 = new rosu.Performance({
      mods: modsID,
      accuracy: 99,
    }).calculate(map);

    const pp = new rosu.Performance({
      mods: modsID,
    }).calculate(map);

    const totalSeconds = beatmap.total_length;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    // Use String.padStart to ensure the seconds have at least two digits
    const formattedSeconds = String(seconds).padStart(2, "0");
    const formattedTime = `${minutes}:${formattedSeconds}`;
    const dtotalSeconds = beatmap.hit_length;
    const dminutes = Math.floor(dtotalSeconds / 60);
    const dseconds = dtotalSeconds % 60;
    // Use String.padStart to ensure the seconds have at least two digits
    const dformattedSeconds = String(dseconds).padStart(2, "0");
    const dformattedTime = `${dminutes}:${dformattedSeconds}`;

    // Creating an embed
    const embed = new EmbedBuilder()
      .setTitle(
        `${beatmap.beatmapset.artist} - ${beatmap.beatmapset.title}`
      )
      .setURL(`https://osu.ppy.sh/b/${beatmap.id}`)
      .setImage(`${beatmap.beatmapset.covers.cover}`)
      .setDescription(
        `:notes: [Song Preview](https://b.ppy.sh/preview/${beatmap.beatmapset.id}) [Background](https://b.ppy.sh/preview/${beatmap.beatmapset.id}) Map ID: ${beatmapId}`
      )
      .setAuthor({
        name: `Mapset by ${beatmap.beatmapset.creator}`,
        iconURL: `https://a.ppy.sh/${dataOsuUser.id}`,
        url: `https://osu.ppy.sh/u/${dataOsuUser.id}/`,
      })
      .setColor(0x18e1ee) // You can change the color as per your preference
      .addFields([
        {
          name: `[${beatmap.version}] + ${Mods}`,
          value: `Combo: \`${beatmap.max_combo}\` Stars: \`${beatmap.difficulty_rating}★\` BPM: \`${beatmap.bpm}\` Length: \`${formattedTime} (${dformattedTime})\` 
                    Object: \`${totalObject}\` Circle: \`${beatmap.count_circles}\` Slider: \`${beatmap.count_sliders}\` Spiner: \`${beatmap.count_spinners}\`
                    CS: \`${beatmap.cs}\` AR: \`${beatmap.ar}\` OD: \`${beatmap.accuracy}\` HP: \`${beatmap.drain}\``,
          inline: true,
        },
        {
          name: `Download`,
          value: `[Direct](http://tnnlb.dev/quna/osudirect?direct=b/${beatmapId}) | [Web](https://osu.ppy.sh/beatmapsets/${beatmapId}/download) | [BTCT](https://beatconnect.io/b/${beatmap.beatmapset_id}) | [Mino](https://catboy.best/d/${beatmap.beatmapset_id}) | [Nerinyan](https://api.nerinyan.moe/d/${beatmap.beatmapset_id}) | [Sayabot](https://dl.sayobot.cn/beatmaps/download/full/${beatmap.beatmapset_id})\nNo Video\n[Nerinyan](https://api.nerinyan.moe/d/${beatmap.beatmapset_id}?nv=1) | [Sayabot](https://dl.sayobot.cn/beatmaps/download/novideo/${beatmap.beatmapset_id})`,
          inline: false,
        },
        {
          name: `PP`,
          value: `\`\`\`Acc │ 95% │ 96% │ 97% │ 98% │ 99% │ 100%\n────┼─────┼─────┼─────┼─────┼─────┼─────\nPP  │ ${pp95.pp.toFixed(0)} │ ${pp96.pp.toFixed(0)} │ ${pp97.pp.toFixed(0)} │ ${pp98.pp.toFixed(0)} │ ${pp99.pp.toFixed(0)} │ ${pp.pp.toFixed(0)} \`\`\``,
          inline: false,
        },
      ]);

      const button = new ButtonBuilder()
      .setLabel("Map Preview")
      .setStyle(ButtonStyle.Link)
      .setURL(`https://preview.tryz.id.vn/?b=${beatmap.id}`);

    const row = new ActionRowBuilder().addComponents(button);
    // Sending the reply with the embed
    message.reply({
      embeds: [embed],
      components: [row],
    });
  }
};
