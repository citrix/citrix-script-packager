#!/usr/bin/env node --harmony
const admZip = require('adm-zip');
const fs = require('fs');
const archiver = require('archiver');
const walk = require('walk');
const jsonquery = require('json-query');
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
.option('-s --syncmanifest','Sync manifest file (without packaging) with the current template files. You may need to use this to force a sync.')
.option('-d --clean','Clean the output directory of build assets.')
.option('-p --package','Packup up the current template files into a VSIX file for use within the Citrix Developer extension.')
.parse(process.argv);

//build a yeoman environment
var env = yoenv.createEnv();
//console.log(cmdr.create);
//return;

if (!cmdr.create)
{
    if ( fse.existsSync(manifestFile) )
    {
        manifest = jsonfile.readFileSync(manifestFile);
    }
}


if ( cmdr.package )
{
    console.log(fs.existsSync(manifestFile));
    
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
else if (cmdr.syncmanifest)
{
    if ( fse.existsSync(manifestFile) )
    {
        syncManifest();
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

    console.log(chalk.yellow('Syncing manifest...'));
    syncManifest();
    console.log(chalk.yellow('Done...'));

    createZip();
}
function clearOutputFiles(packageName)
{    
    console.log(chalk.yellow('removing the output directory and all sub directories and files...'));
    fse.removeSync('./output');
    console.log(chalk.yellow('Complete removing output directory'));


}
function createZip()
{   
    // //read the manifest file
    // var manifestFile = './manifest.json';
    // var manifest = jsonfile.readFileSync(manifestFile);

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
    
    var files = fs.readdirSync('./packages');
    files.forEach(file => {
        var stats = fs.statSync(`./packages/${file}`)
        if ( stats.isDirectory() )
        {
            console.log(chalk.green(`Adding the ${file} to the package`));
            archive.directory(`packages/${file}/`);
        }
    });

    syncManifest
    
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
    console.log(chalk.yellow('removing the output directory and all sub directories and files...'));
    fs.renameSync(`./output/${packageName}.zip`,`./output/${packageName}.vsix`);
    console.log(chalk.yellow('Complete removing output directory'));
}

function syncManifest()
{
    //loop through all files to add to the manifest file
    console.log(chalk.yellow('Adding untracked files to the manifest json file.'));
    
    walker = walk.walk('./packages/', null);
    walker.on("file", function (root, fileStats, next) {
        var queryResult = jsonquery(`files[name=${fileStats.name}].name`, {data: manifest});
        
        if ( queryResult.value === null )
        {
            fileInfo = {};
            fileInfo.name = fileStats.name;
            fileInfo.description = '[Fill out this description to help users understand what your script does]';
            if ( !manifest.hasOwnProperty('files'))
            {
                manifest.files = [];
            }
            manifest.files.push(fileInfo);
            console.log(chalk.green(`Added file ${fileStats.name} to manifest`));
        }
        next();
    });
    //when the process is done traversing the directories and files it will 
    walker.on("end", () => {
        if ( manifest.hasOwnProperty('files'))
        {
            var templateDir = fs.readdirSync('./packages/');
            templateDir.forEach(dir => {
                manifest.files.forEach(file => {
                    var exists = fs.existsSync(`./packages/${dir}/${file.name}`);
                    if ( !exists )
                    {
                        console.log(chalk.red(`Removing ${file.name} from the manifest since it doesn't exist on disk`));
                        manifest.files.splice(file,1);
                    }
                });
            });
        }
        // console.log(chalk.yellow('Writing updated manifest file to disk'));
        fs.writeFile("./manifest.json", JSON.stringify(manifest,null,2), (err) => {
            if ( err )
            {
                console.log(chalk.red(err));
            }
        });
    });


    
    
    
}

