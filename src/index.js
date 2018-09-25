const parser = require("./parser");

module.exports.parse = parser.parse;
module.exports.parseLine = parser.parseHead;
module.exports.skipWhitespaces = parser.skipWhitespaces;
module.exports.parseWord = parser.parseWord;
module.exports.flatten = parser.flatten
