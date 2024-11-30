const fs = require('fs');
const path = require('path');

module.exports = (directory, folderOnly = false) => {
    let fileName = [];

    const files = fs.readdirSync(directory, { withFileTypes: true });

    for (const file of files) {
        const filePath = path.join(directory, file.name);

        if (folderOnly) {
            if (file.isDirectory) {
                fileName.push(filePath);
            }
        } else {
            if (file.isFile()) {
                fileName.push(filePath);
            }
        }
    }

    return fileName;
}