#!/usr/bin/env node --harmony

const program = require('commander');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const recursive = require('recursive-readdir');
const fse = require('fs-extra');
const admZip = require('adm-zip');
const toXml = require('jstoxml');
const url = require('url').URL;

program
    .option("-d, --directory <dir>","Root directory to search for .vsix files")
    .option("-b, --baseurl <baseurl>","Specify the base URL where the feed will be hosted. This can start with FILE:// or HTTP://")
    .option("-g, --github","Specify this parameter if you are going to host the RSS feed on github")
    .parse(process.argv);


    
if ( program.baseurl === undefined )
{
    console.log(chalk.red('Please specify the base url you would like to use in the RSS feed. You can use the --baseurl parameter to specify this.'));
    return;
}
if ( program.directory === undefined )
{
    console.log(chalk.red('Please specify the directory where your .vsix script packages are located. You can use the --directory parameter to specify this.'));
    return;
}

//defining the rss feed base
let rssFeed = {
    _name: 'rss',
    _attrs: {
        version: '2.0'
    },
    _content: {
        channel: [
            {
                title: 'Citrix Script packages',
                description: 'Custom feed for Citrix Script packages',
                link: 'http://developer.citrix.com'
            }
        ]
    }
};

let rssOptions = {
    header: true,
    indent: '  '
};

var directoryPath = path.resolve(program.directory);

var destPath = path.normalize(path.resolve(`./vsixfeed/`));

//clean out vsixfeed path
console.log(chalk.yellow('removing the vsixfeed directory and all sub directories and files...'));
fse.removeSync('./vsixfeed');
console.log(chalk.yellow('Completed removing vsixfeed directory'));

//make sure the path exists, create it if it doesnt.
fse.mkdirpSync(destPath);

//find all
recursive(path.resolve(program.directory))
.then( (files) => {
    //loop through each return file and only
    //select the vsix files.
    files.forEach(file => {
        var ext = path.extname(file);
        
        if ( ext == '.vsix')
        {
            var baseName = path.basename(file);
            var fullDestPath = path.normalize(`${destPath}/${baseName}`);
            console.log(fullDestPath);
            
            //make sure the path exists, create it if it doesnt.
            fse.mkdirpSync(destPath);
            //copy found file into the vsixfeed directory
            fs.copyFileSync(file,fullDestPath);

            let zip = new admZip(fullDestPath);

            zip.getEntries().forEach(function(entry) {
                var entryName = entry.entryName;

                if ( entryName.indexOf('manifest.json') != -1 )
                {
                    console.log(`Found manifest file in VSIX (${baseName})`);
                    
                    var newVsixItem = {};
                    newVsixItem.item = {};

                    let manifest = JSON.parse(zip.readAsText(entry));

                    console.log('Getting file information...');

                    newVsixItem.item.title = `${manifest.packageName}`;

                    newVsixItem.item.description = `${manifest.packageDescription}`;

                    newVsixItem.item.author = manifest.author;

                    if ( program.baseurl.endsWith('/') )
                    {
                        newVsixItem.item.link = `${program.baseurl}vsixfeed/${baseName}`;
                    }
                    else
                    {
                        newVsixItem.item.link = `${program.baseurl}/vsixfeed/${baseName}`;       
                    }

                    if ( program.github )
                    {
                        newVsixItem.item.link += '?raw=true';
                    }
                    console.log('Adding VSIX to the rss feed');
                    
                    rssFeed._content.channel.push(newVsixItem);
                }
                
            });
        }
    }); 
})
.then( () => {
    fse.writeFileSync(path.normalize(path.resolve('./vsixfeed/feed.rss')),toXml.toXML(rssFeed, rssOptions));
    
    console.log(chalk.green('Created rss feed'));
    
    var feedUrl = new url(program.baseurl);

    switch (feedUrl.protocol.toLowerCase()) 
    {
        case 'file:':
            console.log(chalk.green(`feed is available at ${feedUrl.protocol}//${feedUrl.host}/${path.resolve('./vsixfeed/feed.rss')}`));
            break;
        case 'http:':
            console.log(chalk.green(`feed is available at ${feedUrl.protocol}//${feedUrl.host}/vsixfeed/feed.rss`));
            break;
        default:
            break;
    }

});





