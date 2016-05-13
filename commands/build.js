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

	    ['constants', 'controllers', 'directives', 'factories', 'filters', 'services'].forEach(function (n){
	        var t = module[n] = [];

	        if(fs.existsSync(path.join(modulesAbsPath, mn, n))) {
	            fs.readdirSync(path.join(modulesAbsPath, mn, n)).forEach(function (name) {
                    /**
                     * @param  {String} parentName
                     * @param  {String} pathName
                     */
                    (function parse(parentName, relativePath) {
                        fs.readdirSync(path.resolve(args.public, relativePath)).forEach(function (itemName) {
                            var itemRelativePath = path.join(relativePath, itemName);
                            var itemAbsPath = path.resolve(args.public, itemRelativePath);
                            
                            if (itemName === 'index.js') {
                                t.push({
                                    name: parentName,
                                    path: relativePath,
                                    content: fs.readFileSync(itemAbsPath, 'utf8')
                                });
                            } else {
                                var stats = fs.lstatSync(itemAbsPath);
                                
                                if (stats.isDirectory()) {
                                    parse(parentName + '/' + itemName, itemRelativePath);
                                }
                                else if (stats.isFile() && path.extname(itemName) === '.js') {
                                    t.push({
                                        name: parentName + '/' + itemName.substring(0, itemName.lastIndexOf(path.extname(itemName))),
                                        path: relativePath,
                                        content: fs.readFileSync(itemAbsPath, 'utf8')
                                    });
                                }
                            }
                        });
                    })(name, path.join(args.modules, mn, n, name));
	            });
            }
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

	    return '(function(module){ \n =main= \n =constants= \n =controllers= \n =directives= \n =factories= \n =filters= \n =services= \n })(=module=);'
	                .replace('=constants=', wrap(module.constants))
	                .replace('=controllers=', wrap(module.controllers))
	                .replace('=directives=', wrap(module.directives))
	                .replace('=factories=', wrap(module.factories))
	                .replace('=filters=', wrap(module.filters))
	                .replace('=services=', wrap(module.services))
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
