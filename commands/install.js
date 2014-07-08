var fs = require('fs'),
	path = require('path'),
	JSZip = require("jszip"),
	walk = require("walk"),
	mkdirp = require('mkdirp');

module.exports = function(args){
	var remotePackageName = args._[1],
		remoteModuleName = args.module,
		parentModuleName = args.parent,
		changedModuleName = args.as;

	var	modulesAbsPath = path.resolve(args.public, args.modules),
		remoteModulesAbsPath = '';
		
	var content = fs.readFileSync(path.resolve(remoteModulesAbsPath, remotePackageName + '.zip')),
		zip = new JSZip(content);

	for(var fname in zip.files){
		var finfo = zip.files[fname],
			nfpath = path.resolve(modulesAbsPath, parentModuleName || './', path.dirname(fname));

		mkdirp.sync(nfpath);
		fs.writeFileSync(nfpath + '/' + path.basename(fname), finfo.asText());
	}
};