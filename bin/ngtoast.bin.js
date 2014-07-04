#!/usr/bin/env node
var fs = require('fs'),
    path = require('path'),
    args = require('optimist').argv,
    config;

// read config
var configFile = './ngtoast.json';
if(fs.existsSync(configFile)){
    var cs = fs.readFileSync(configFile);
    config = JSON.parse(cs);
}
else
    config = args;

// read modules
var modules = [],
    modulesScript;

fs.readdirSync(path.join(config.publicAbsPath, config.modulesRelPath)).forEach(function(mn){
    var module = {
        name: mn,
        path: path.join('/', config.modulesRelPath, mn, '/'),
        main: fs.readFileSync(path.join(config.publicAbsPath, config.modulesRelPath, mn, '/module.js'), 'utf8')
    };

    ['controllers', 'directives', 'factories', 'filters'].forEach(function (n){
        var t = module[n] = [];

        if(fs.existsSync(path.join(config.publicAbsPath, config.modulesRelPath, mn, n)))
            fs.readdirSync(path.join(config.publicAbsPath, config.modulesRelPath, mn, n)).forEach(function(name){
                t.push({
                    name: name,
                    path: path.join('/', config.modulesRelPath, mn, n, name, '/'),
                    content: fs.readFileSync(path.join(config.publicAbsPath, config.modulesRelPath, mn, n, name, '/index.js'), 'utf8')
                });
            });
    });
    modules.push(module);
});

modulesScript = modules.map(function(module){
    var cmns = modules
                .map(function(m){ return m.name; })
                .filter(function(mn){
                    var ic = mn.indexOf(module.name) !== -1,
                        kc = mn.indexOf('.', module.name.length + 1) === -1;

                    return mn !== module.name && ic && kc;
                });

    function wrap(items){
        return items.map(function(item){
            return '(function(current){ =content= })(=item=);'
                        .replace('=content=', item.content)
                        .replace('=item=', JSON.stringify({
                            name: item.name,
                            path: item.path
                        }));
        }).join('\n');
    }

    return '(function(module){ \n =main= \n =controllers= \n =directives= \n =factories= \n =filters= \n })(=module=);'
                .replace('=main=', module.main)
                .replace('=controllers=', wrap(module.controllers))
                .replace('=directives=', wrap(module.directives))
                .replace('=factories=', wrap(module.factories))
                .replace('=filters=', wrap(module.filters))
                .replace('=module=', JSON.stringify({
                    name: module.name,
                    path: module.path,
                    dependencies: cmns
                }));
}).join('\n');

var fs = require('fs');
fs.writeFileSync(config.output, modulesScript); 