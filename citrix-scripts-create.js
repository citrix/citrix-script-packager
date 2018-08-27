#!/usr/bin/env node --harmony
const yoenv = require('yeoman-environment');
const program = require('commander');

program.parse(process.argv);

//build a yeoman environment
var env = yoenv.createEnv();
//create a template
env.register(require.resolve('./generators/index.js'),'citrix-create-scripttemplate');
env.run('citrix-create-scripttemplate');
