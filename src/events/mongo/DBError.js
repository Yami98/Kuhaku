const chalk = require("chalk");

module.exports = {
    name:"err",
    execute(err) {
        console.log(
            chalk.orange(`There is an error when connecting to MongoDB: \n${err}`)
        );
    },
};