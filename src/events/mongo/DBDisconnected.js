const chalk = require("chalk");

module.exports = {
    name:"disconnected",
    execute() {
        console.log(chalk.red("Disconnected from MongoDB."));
    },
};