const yeoman = require('yeoman-generator');
const mkdir = require('make-dir');

module.exports = class extends yeoman
{
    prompting()
    {
        return this.prompt([
            {
                type: 'input',
                name: 'packageId',
                message: 'Enter the package ID (ex: citrix.powershell.pvs)'
            },
            {
                type: 'input',
                name: 'packageName',
                message: 'Enter the friendly package name (ex: pvs)'
            },
            {
                type: 'input',
                name: 'packageDesc',
                message: 'Enter a description of the package you are building'
            },
            {
                type: 'input',
                name: 'packageVersion',
                message: 'Enter the the version of this package (ex: 1.0.0)'
            },
            {
                type: 'input',
                name: 'packageAuthor',
                message: 'Enter the author of this package'
            },
            {
                type: 'input',
                name: 'mainFileToRun',
                message: 'List the initial file (if any) that needs to be run'
            },
            {
                type: 'confirm',
                name: 'defaultFile',
                message: 'Would you like to create a default powershell file?'
            }
        ]).then(function(answers) {
            this.packageId = answers.packageId;
            this.packageName = answers.packageName;
            this.packageDesc = answers.packageDesc;
            this.packageVersion = answers.packageVersion;
            this.packageAuthor = answers.packageAuthor;
            this.defaultFile = answers.defaultFile;
            this.mainFileToRun = answers.mainFileToRun;
        }.bind(this));
    }
    writing()
    {
        this.fs.copyTpl(
            this.templatePath('manifest.json'),
            this.destinationPath('manifest.json'),
            {
                packageId: this.packageId,
                packageName: this.packageName,
                packageDesc: this.packageDesc,
                packageVersion: this.packageVersion,
                packageAuthor: this.packageAuthor,
                mainFileToRun: this.mainFileToRun
            }
        );

        this.fs.copyTpl(
            this.templatePath('./README.md'),
            this.destinationPath('README.md'),
            {
                packageId: this.packageId,
                packageName: this.packageName,
                packageDesc: this.packageDesc,
                packageVersion: this.packageVersion,
                packageAuthor: this.packageAuthor
            }
        )
        mkdir.sync(`packages/${this.packageName}`);

        if ( this.defaultFile )
        {
            this.fs.copy(
                this.templatePath('base.ps1'),
                this.destinationPath(`packages/${this.packageName}/example.ps1`)
            );
        }
       
    }
}