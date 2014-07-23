Sample.JS
=========

Put the library's documentation here, including usage and programming samples.

Building
--------

For building the library from source you'll need npm (node package manager) and grunt installed on your machine. On a Mac with installed MacPorts you'd use:
```Shell
    sudo port install npm
    sudo npm install -g grunt-cli
```
  
Remember to user the "-g" flag when installing grunt in order to install it globally for all users.

Check your installation by running 
```Shell
    grunt clean
```
    
Inside the projects root folder. Should clean the project without any complaints.



About Setting Up This Project
-----------------------------

First, we wrote initial package.json and Gruntfile.js files following the advice at
* http://gruntjs.com/getting-started
* http://merrickchristensen.com/articles/gruntjs-workflow.html

Syntax of both files needs to be correct ;-)

To put this project under grunt's management, we needed to a) install grunt and b) set it up locally in the project

1. installation
```Shell
    sudo port install npm
    sudo npm install -g grunt-cli
    sudo npm install -g grunt-contrib-jshint 
```

2. setting up locally
```Shell
    npm install grunt --save-dev
    npm install grunt-contrib-clean --save-dev
    npm install grunt-contrib-jshint --save-dev
```
 
Afterwards, running grunt inside the project with
```Shell
    grunt
```
just creates an error message with a warning about no "default" task being found.
  
