# Citrix Script Packager

This project is an npm global tool that help developers package up their scripts (powershell, javascript, shell scripts) for use within the [Citrix Developer Extension for Visual Studio Code.](https://marketplace.visualstudio.com/items?itemName=CitrixDeveloper.citrixdeveloper-vscode)

## Installation

We distribute this tool using npm. To install this in your environment, execute the following command

```sh
npm install -g citrix-scripts
```

## Usage

To get the CLI help, execute

```sh
citrix-scripts --help
```

This is created to help you do a few basic items.

1. Start creating your script template

2. Package up your template into a .vsix file for use with the Citrix Developer extension.

3. Create a feed for use with the [Citrix Developer Extension for Visual Studio Code.](https://marketplace.visualstudio.com/items?itemName=CitrixDeveloper.citrixdeveloper-vscode)

## Getting Started

### Creating a template

The easiest way to start creating a script package is to run the following command

```sh
citrix-scripts create
```

This will prompt you for a few items and then create your base template layout. PLease note the friendly name that you enter, you will use this later.

### Packaging a script template

Once you have your template all set, copied the correct script files into the friendly name location, you will need to package it up to be used within the Citrix Developer extension. You can do this with the following command

```sh
citrix-scripts package
```

This will create a .vsix file that can then be shared with the community and imported into the Citrix Developer extension.

### Creating an RSS feed

This helps you to aggregate all of your script packages that can be consumed by the Citrix Developer Extension.

```sh
citrix-scripts feed --directory [] --baseurl [url] --github
```

Let's break down the options here that you will need in order to create the RSS feed.

* --directory
    
    The --directory option allows you to specify a location where your .vsix files are located. This can be anywhere on your computer as the script will traverse from the location you give recursivly to find all .vsix files and copy them into a vsixfeed directory.
     
* --baseurl

    The --baseurl option if the site url where your feed.rss file will be hosted. This can be a webserver you maintain (http://www.mydomain/com/) or a file share on a network share (file:///myvisxfiles/company/) or hosted on a github url (https://www.github.com/johnmcbride/reponame)

* --github

    Thes github option is to be used if you are hosting the feed.rss file on a github repo. This will append '?raw=true' to the end of the link url. This is to help with downloading the binary package.



## Contributing

Please read [CONTRIBUTING.md](https://gist.github.com/PurpleBooth/b24679402957c63ec426) for details on our code of conduct, and the process for submitting pull requests to us.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/your/project/tags).

## Authors

* **John McBride** - *Initial work* - [github: johnmcbride](https://github.com/johnmcbride)
[Twitter: johnmcbride](http://twitter.com/johnmcbride)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
