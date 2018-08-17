#!/usr/bin/env node --harmony
const admZip = require('adm-zip');
const fs = require('fs');
const archiver = require('archiver');
const chalk = require('chalk');
const yoenv = require('yeoman-environment');
const jsonfile = require('jsonfile');
const fse = require('fs-extra');
var cmdr = require('commander');
var package = require('./package.json');

//read the manifest file
const manifestFile = './manifest.json';
var manifest = null;

cmdr.version(package.version)
.option('-c --create','Creates a new Citrix script package.')
.option('-r --clean','Clean the output directory of build assets.')
.option('-p --package','Packup up the current template files into a VSIX file for use within the Citrix Developer extension.')
.parse(process.argv);

//build a yeoman environment
var env = yoenv.createEnv();

if (!cmdr.create)
{
    if ( fse.existsSync(manifestFile) )
    {
        manifest = jsonfile.readFileSync(manifestFile);
    }
}

if ( cmdr.package )
{
    if ( fse.existsSync(manifestFile) )
    {
        createPackage();
    }
    else
    {
        console.log("manifest.json files doesn't exitst. Maybe you need to run 'citrix-script-packager --create'?");
        return;
    }
}
else if ( cmdr.clean )
{
    if ( fse.existsSync(manifestFile) )
    {
        clearOutputFiles(manifest.packageName);
    }
    else
    {
        console.log("manifest.json files doesn't exitst. Maybe you need to run 'citrix-script-packager --create'?");
        return;
    } 
}
else if ( cmdr.create )
{
    //create a template
    env.register(require.resolve('./generators/index.js'),'citrix-create-scripttemplate');
    env.run('citrix-create-scripttemplate');
}

function createPackage()
{
    //clean build assests
    console.log(chalk.yellow('Cleaning existing build assets'));
    clearOutputFiles(manifest.packageName);

    createZip();
}
function clearOutputFiles(packageName)
{    
    console.log(chalk.yellow('removing the output directory and all sub directories and files...'));
    fse.removeSync('./output');
    console.log(chalk.yellow('Completed removing output directory'));
}
function createZip()
{   
    //create the dir
    fs.mkdirSync('./output/');

    //creating the admzip object
    const zip = new admZip();
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