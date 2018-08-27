#!/usr/bin/env node --harmony
var cmdr = require('commander');
var package = require('./package.json');


cmdr.version(package.version)
    .command("create","Creates a new Citrix script package template.")
    .command("feed","Creates the RSS feed based on the VSIX files in the specified directory.")
    .command("package","Package up the current template files into a VSIX file.")
    .command("clean","Cleans up the output artifacts from the package command.")
    .parse(process.argv);






