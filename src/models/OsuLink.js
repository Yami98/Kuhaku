const mongoose = require('mongoose');

// Define the schema for linking Discord IDs with osu! data
const osuLinkSchema = new mongoose.Schema({
  discordID: {
    type: String,
    required: true,
    unique: true,
  },
  osuUsername: {
    type: String,
    required: true,
  },
  osuID: {
    type: Number,
    required: true,
  },
});

// Create the model based on the schema
const OsuLink = mongoose.model('OsuLink', osuLinkSchema);

module.exports = OsuLink;
