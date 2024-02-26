const fs = require("fs");

function removeFile(path, filename) {
    fs.unlinkSync(`/public/uploads/${path}/${filename}`);
}

module.exports = { removeFile };