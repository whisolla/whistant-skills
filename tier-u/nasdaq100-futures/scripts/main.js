// Backward-compat wrapper: re-exports everything from nasdaq100-futures.js
var main = require('./nasdaq100-futures.js');
module.exports = {
  handler: main.handler,
  runFromParams: main.runFromParams,
  parseCommand: main.parseCommand
};
