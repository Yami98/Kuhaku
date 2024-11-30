const {
  Client,
  Interaction,
  ApplicationCommandOptionType,
  EmbedBuilder,
} = require("discord.js");
const { v2 } = require("osu-api-extended");
const OsuLink = require("../../models/OsuLink"); // MongoDB model
const puppeteer = require("puppeteer");
const fs = require("fs");

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

      // Fetch osu! user details, either from the provided nickname or linked Discord account
      if (nickname) {
        dataOsu = await v2.users.details({ user: `${nickname}` });
      } else {
        const linkedUser = await OsuLink.findOne({
          discordID: interaction.user.id,
        });

        if (!linkedUser) {
          await interaction.editReply(
            "You have not linked your osu! account yet. Please use the `/osu-link` command."
          );
          return;
        }

        dataOsu = await v2.users.details({ user: linkedUser.osuID });
      }

      // Construct the osu-sig image URL
      const osuSigImageUrl = `https://osu-sig.vercel.app/skills?user=${dataOsu.username}&mode=std&lang=en&hue=200`;

      // Generate the image with larger content and transparent background
      const imagePath = `./output-${interaction.user.id}.png`; // Temporary path to store the screenshot
      await generateImage(osuSigImageUrl, imagePath);

      // Build the embed message with the generated image
      const embed = new EmbedBuilder()
        .setColor(0x18e1ee)
        .setImage("attachment://skills.png") // Use the file attachment in the embed
        .setAuthor({
          name: `${dataOsu.username}'s Skills Stats`,
          iconURL: `https://osu.ppy.sh/images/flags/${dataOsu.country_code}.png`,
          url: `https://osu.ppy.sh/u/${dataOsu.id}`,
        });

      // Send the image in the reply
      await interaction.editReply({
        files: [
          {
            attachment: imagePath,
            name: "skills.png", // Name of the image file
          },
        ],
        embeds: [embed],
      });

      // Clean up the generated image file after sending
      fs.unlinkSync(imagePath);
    } catch (error) {
      console.error(error);
      await interaction.editReply(
        "An error occurred while fetching the osu! skills."
      );
    }
  },

  name: "skills",
  description: "View osu! skills details",
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

/**
 * Function to generate an image from a URL using Puppeteer
 * @param {string} url - The URL to capture a screenshot from
 * @param {string} outputPath - The path where the screenshot should be saved
 */
const generateImage = async (url, outputPath) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Set the viewport size for scaling the content
  await page.setViewport({ width: 400, height: 250, deviceScaleFactor: 2 }); // Increase for larger content

  // Go to the URL and wait for the page to load
  await page.goto(url, { waitUntil: "networkidle2" });

  // Ensure the body element exists before trying to modify it
  await page.evaluate(() => {
    const body = document.body;
    if (body) {
      // Set transparent background if body is available
      body.style.background = "transparent"; // Set transparent background
      body.style.borderRadius = "20px"; // Apply rounded corners (adjust radius as needed)
      body.style.overflow = "hidden"; // Hide any overflow caused by rounding corners
    }
  });

  // Take the screenshot with transparent background
  await page.screenshot({
    path: outputPath,
    omitBackground: true, // Ensures the background is transparent
  });

  await browser.close();
};
