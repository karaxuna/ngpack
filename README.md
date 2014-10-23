# ngtoast

Package manager for angularjs

## Installation:

    npm install ngtoast

## File structure ([example](https://github.com/karaxuna/ngtoast-example)):

    -public
        -modules
            -[module]
                -directives
                    -[directive name]
                        -index.js
                -controllers
                    -[controller name]
                        -index.js
                -filters
                    -[filter name]
                        -index.js
                -factories
                    -[factory name]
                        -index.js
                -views
                    -[view name]
                -module.js
            -[module].[child]
                ... same here
    -ngtoast.json
    
## Config

Parameters must be saved in `ngtoast.json` or passed through command line:

    {
    	"public": [path to public folder],
        "modules": [relative path from public to modules folder],
        "output": [output file name],
        "minify": [if parameter is present output is minified],
        "relative": [if paths in result file must be relative]
    }
    
Building concatenated file to serve to browser (will be saved in directory matching `output` parameter in configuration):

    ngtoast build

## Output

File will contain all modules, directives, factories, controllers and filters of application. Each of them will have additional parameters supplied:

    module: {
        name: [module name],
        path: [module path],
        dependencies: [array of child module names]
    },
    
    current: {
        name: [current directive/filter/factory/controller name],
        path: [path]
    }
    
Example (`[module]/module.js`):

```javascript
angular
    .module(module.name, ['ui.router'].concat(module.dependencies.concat))
    .config(['$stateProvider', function(stateProvider){
        stateProvider
            .state(module.name, {
                url: [module url],
                templateUrl: module.path + '/views/[view name]',
                // controller name is prefixed to avoid conflict
                controller: module.name + '.c.[controller name]'
            });
    }]);
```
        
Example (`[module]/controllers/[controller name]/index.js`):

```javascript
angular.module(module.name).controller(module.name + '.c.' + current.name,
    ['$scope', function(scope){
        ...
    }]);
```

## Watch modules folder and call `ngtoast build` each time something changes

    ngtoast watch

## Remote packages (not implemented yet!)

installing:

    ngtoast install [remote package name] --module [module name] --parent [parent module name] --as [changed module name]

uninstalling:

    ngtoast uninstall [package name]

publishing:

    ngtoast publish [package name]