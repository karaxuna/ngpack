var fs = require('fs'),
	path = require('path'),
	chokidar = require('chokidar'),
	build = require('./build');

module.exports = function(args){
	var modulesAbsPath = path.resolve(args.public, args.modules);
	chokidar.watch(modulesAbsPath, { ignored: /[\/\\]\./, persistent: true })
			.on('change', rebuild);

	function rebuild(){
		build(args);
	}

	rebuild();
};