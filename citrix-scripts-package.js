#!/usr/bin/env node --harmony
const program = require('commander');
//define the manifest file
const manifestFile = './manifest.json';
const jsonfile = require('jsonfile');
const chalk = require('chalk');
const fs = require('fs');
const archiver = require('archiver');
const fse = require('fs-extra');

program
    .parse(process.argv);

if ( !fse.existsSync(manifestFile) )
{
    console.log("manifest.json files doesn't exist. Maybe you need to run 'citrix-scripts create'?");
    return;
}

var manifest = jsonfile.readFileSync(manifestFile);

//clean build assests
console.log(chalk.yellow('Cleaning existing build assets'));
clearOutputFiles(manifest.packageName);

createZip(manifest);

function createZip(manifest)
{   
    //create the dir
    fs.mkdirSync('./output/');

    const packageFileName = `./output/${manifest.packageName}.zip`;

    var output = fs.createWriteStream(packageFileName);

    var archive = archiver('zip', {
        zlib: { level: 9 } // Sets the compression level.
    });

    // good practice to catch this error explicitly
    archive.on('error', function(err) {
        console.log(chalk.red(err.message));
    });

    // pipe archive data to the file
    archive.pipe(output);

    console.log(chalk.yellow('Reading templates directory'));
    
    console.log(chalk.green(`Adding the files and directories under the 'packages' root directory to the package`));
    //adding the zip archive using the glob feature. This also lets us
    //configure which files do not get added to the archive.
    archive.glob('./packages/**', { ignore: '.*'});

    //add the updated manifest.json file into the zip file
    console.log(chalk.yellow('Adding updated manifest file to the package.'));
    archive.file('./manifest.json', {name: `/packages/${manifest.packageName}/manifest.json`})

    console.log(chalk.yellow('Adding README file to the package.'));
    archive.file('./README.md', {name: `/packages/${manifest.packageName}/README.md`})

    archive.finalize();

    console.log(chalk.yellow('Making VSIX file...'));
    renameFileToVSIX(manifest.packageName);

    console.log(chalk.green(`Created ./output/${manifest.packageName}.vsix`));
    
    console.log(chalk.green(`\nThe package is now ready to use in the Citrix VSCode extension.`)); 
}

function renameFileToVSIX(packageName)
{
    console.log(chalk.yellow(`Renaming ${packageName}.zip to ${packageName}.vsix`));
    fs.renameSync(`./output/${packageName}.zip`,`./output/${packageName}.vsix`);
    console.log(chalk.yellow('Completed renaming'));
}

function clearOutputFiles()
{
    console.log(chalk.yellow('removing the output directory and all sub directories and files...'));
    fse.removeSync('./output');
    console.log(chalk.yellow('Completed removing output directory'));
}

