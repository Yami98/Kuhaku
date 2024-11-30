const axios = require("axios");
const fs = require("fs");

// Function to request a replay
async function requestReplay(
  osuName,
  replayID = "",
) 

{ 
  try {
    const response = await axios.post("https://apis.issou.best/ordr/renders", {
      nickname: osuName,
      replayURL: `https://osu.ppy.sh/scores/${replayID}`,
      resolution: "1280x720 (60fps)",
      skin: "Black and White (white cursor)",
    });

    if (response.data.error) {
      return { error: response.data.error };
    }

    return { replayUrl: response.data.replay_url };
  } catch (error) {
    console.error(
      "Error requesting replay:",
      error.response ? error.response.data : error.message
    );
    return { error: "There was an error requesting the replay." };
  }
}

module.exports = requestReplay;