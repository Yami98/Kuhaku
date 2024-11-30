const { auth, v2 } = require('osu-api-extended');
const { LOGIN, PASSWORD } = process.env;
const fs = require('fs');
const path = require('path');

async function downloadReplay(osuID, interaction) {
  const filePath = './cache/replay.osr'; // Path to save the replay file

  try {
    // Authenticate using lazer credentials
    await auth.login({
      type: 'lazer',
      login: LOGIN,
      password: PASSWORD,
      cachedTokenPath: './lazer_api.json' // Cache token to avoid frequent logins
    });

    // Attempt to download the replay
    const result = await v2.scores.download({
      id: osuID,
      file_path: filePath
    });

    if (result.error) {
      console.log('Error downloading replay:', result.error);
      return;
    }

    // Check if the replay file exists after downloading
    if (fs.existsSync(filePath)) {
      // Log the success
      console.log('Replay downloaded:', result);

      // Send the replay file in Discord
      await interaction.reply({
        content: 'Here is the replay file!',
        files: [filePath], // Attach the replay file to the Discord message
      });

      // Optionally, you can delete the file after uploading
      fs.unlinkSync(filePath); // Delete the file after sending to free up space
    } else {
      console.log('Replay file not found.');
    }
  } catch (error) {
    console.log('Error:', error);
  }
}

module.exports = downloadReplay;
