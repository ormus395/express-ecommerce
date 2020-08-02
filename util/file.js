const fs = require("fs");
const path = require("path");

module.exports = (filepath) => {
  const filePath = path.join(__dirname, "../", filepath);
  fs.unlink(filePath, (err) => {
    if (err) throw new Error(err);
  });
};
