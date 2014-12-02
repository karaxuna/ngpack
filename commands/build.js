var fs = require('fs'),
	path = require('path'),
	uglifyJS = require('uglify-js');

module.exports = function(args){
	var modules = [],
	    modulesScript,
	    modulesAbsPath = path.resolve(args.public, args.modules);

	fs.readdirSync(modulesAbsPath).forEach(function(mn){
		var module = {
	        name: mn,
	        path: path.join(args.modules, mn),
	        main: fs.readFileSync(path.join(modulesAbsPath, mn, 'module.js'), 'utf8')
	    };

	    ['controllers', 'directives', 'factories', 'filters'].forEach(function (n){
	        var t = module[n] = [];

	        if(fs.existsSync(path.join(modulesAbsPath, mn, n)))
	            fs.readdirSync(path.join(modulesAbsPath, mn, n)).forEach(function(name){
	                t.push({
	                    name: name,
	                    path: path.join(args.modules, mn, n, name),
	                    content: fs.readFileSync(path.join(modulesAbsPath, mn, n, name, '/index.js'), 'utf8')
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
	                            path: clientify(item.path)
	                        }));
	        }).join('\n');
	    }

	    return '(function(module){ \n =main= \n =controllers= \n =directives= \n =factories= \n =filters= \n })(=module=);'
	                .replace('=controllers=', wrap(module.controllers))
	                .replace('=directives=', wrap(module.directives))
	                .replace('=factories=', wrap(module.factories))
	                .replace('=filters=', wrap(module.filters))
	                .replace('=main=', module.main)
	                .replace('=module=', JSON.stringify({
	                    name: module.name,
	                    path: clientify(module.path),
	                    dependencies: cmns
	                }));
	}).join('\n');

	function clientify(p){
		p = (args.relative ? './' : '/') + p;
		return p.split('\\').join('/');
	}

	fs.writeFileSync(args.output, args.minify ? uglifyJS.minify(modulesScript, { fromString: true }).code : modulesScript);
	console.log('command executed successfully. file saved in ', path.resolve(args.output));
};