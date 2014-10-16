var fs = require('fs'),
	path = require('path'),
	JSZip = require("jszip"),
	walk = require("walk"),
	async = require("async");

module.exports = function(args){
	var publishAs = args._[1],
		moduleNameToPublish = args.module,
		modulesAbsPath = path.resolve(args.public, args.modules),
		zip = new JSZip();

	var fns = fs.readdirSync(modulesAbsPath)
		.filter(function(mn){
			return mn.indexOf(moduleNameToPublish) === 0;
		})
		.map(function(mn){
			var walker  = walk.walk(modulesAbsPath + '/' + mn, { followLinks: false });

			walker.on('file', function(root, stat, next) {
			    var p = path.resolve(root, stat.name),
			    	content = fs.readFileSync(p, 'utf8');
			    	
			    zip.file(p.substring(modulesAbsPath.length + 1, p.length).replace(moduleNameToPublish, publishAs), content);
			    next();
			});

			return function(callback){
				walker.on('end', callback);
			};
		});

	async.parallel(fns, function(){
		var zipAsArray = zip.generate({ type : "nodebuffer" });
		fs.writeFileSync('dir' + publishAs + '.zip', zipAsArray);
	});
};