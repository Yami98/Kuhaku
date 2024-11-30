const chalk = require("chalk");

module.exports = {
    name:"connecting",
    execute() {
        console.log(
            chalk.yellowBright("Connecting to MongoDB...")
        );
    },
};