#!/usr/bin/env node
var fs = require('fs'),
    path = require('path'),
    utils = require('../libs/utils'),
    clArgs = require('optimist').argv,
    filefArgs;

// read config file
var configFilePath = './ngtoast.json';

if(fs.existsSync(configFilePath)){
    var configFile = fs.readFileSync(configFilePath);
    filefArgs = JSON.parse(configFile);
}

// merge arguments
var args = utils.merge(filefArgs, clArgs, [Array]);

// execute command
var cmdName = clArgs._[0],
    cmdPath = path.resolve(__dirname, '../commands/', cmdName + '.js');

if(fs.existsSync(cmdPath))
    require(cmdPath)(args);
else
    throw 'command not found: ' + cmdName;