#!/usr/bin/env node
'use strict';

/**
 * Dependencies
 */
const chalk = require('chalk');
const argv = require('yargs').argv;
const replace = require('../lib/replace-in-file');

//Verify arguments
if (argv._.length < 3) {
  console.error(chalk.red('Replace in file needs at least 3 arguments'));
  process.exit(1);
}

//Collect main arguments
let from = argv._.shift();
const to = argv._.shift();

//Single star globs already get expanded in the command line
const files = argv._.reduce((files, file) => {
  return files.concat(file.split(','));
}, []);

// If the --isRegex flag is passed, send the 'from' parameter
// to the lib as a RegExp object
if (argv.isRegex) {
  const flags = from.replace(/.*\/([gimy]*)$/, '$1');
  const pattern = from.replace(new RegExp(`^/(.*?)/${flags}$`), '$1');
  try {
    from = new RegExp(pattern, flags);
  }
  catch (error) {
    console.error('Could not create RegExp from \'from\' parameter', error);
  }
}

//Log
console.log(`Replacing '${from}' with '${to}'`);

//Create options
const options = {files, from, to};
if (typeof argv.encoding !== 'undefined') {
  options.encoding = argv.encoding;
}
if (typeof argv.allowEmptyPaths !== 'undefined') {
  options.allowEmptyPaths = argv.allowEmptyPaths;
}

//Replace
try {
  const changedFiles = replace.sync(options);
  if (changedFiles.length > 0) {
    console.log(chalk.green(changedFiles.length, 'file(s) were changed'));
    if (argv.verbose) {
      changedFiles.forEach(file => console.log(chalk.grey('-', file)));
    }
  }
  else {
    console.log(chalk.yellow('No files were changed'));
  }
}
catch (error) {
  console.error(error);
}
