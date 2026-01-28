const path = require('path');

// Helper method to construct a path to the parent directory

//process is a global object in Node.js
// main is a property of process that returns the module that was run first
// filename is a property of main that returns the absolute path of the main module file 

module.exports = path.dirname(require.main.filename);