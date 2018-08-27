#!/usr/bin/env node --harmony
const program = require('commander');
const chalk = require('chalk');
const fse = require('fs-extra');

program
    .parse(process.argv);

console.log(chalk.yellow('removing the output directory and all sub directories and files...'));
fse.removeSync('./output');
console.log(chalk.yellow('Completed removing output directory'));

