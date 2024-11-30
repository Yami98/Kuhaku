require("dotenv").config();
const { Client, IntentsBitField, Message } = require("discord.js");
const eventHandler = require("./handlers/eventHandler");
const { TOKEN, MongoDBToken, ClientID, ClientSecret } = process.env;
const mongoose = require("mongoose");
const { v2, auth, mods, tools } = require("osu-api-extended");
const rosu = require("rosu-pp-js");
const axios = require("axios");

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

(async () => {
  try {
    console.log("Connecting to DB...");
    mongoose.set("strictQuery", false);
    await mongoose.connect(MongoDBToken);
    console.log("Connected to DB.");

    eventHandler(client);

    await auth.login({
      type: "v2",
      client_id: ClientID,
      client_secret: ClientSecret,
      cachedTokenPath: "./osu_api.json",
    });

    console.log("Connecting to the bot...");
    client.login(TOKEN);
    
  } catch (error) {
    console.log(`Error: ${error}`);
  }
})();
