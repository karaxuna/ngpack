# ngtoast

Angularjs installable modules. Only adding folder is required to add module in angularjs app.

## Installation:

    npm install ngtoast

## File structure:

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
    
## Parameters in `ngtoast.json`:

    {
    	"publicAbsPath": "./public",
        "modulesRelPath": "modules",
        "output": "./public/modules.js"
    }
    
## Run this command in application folder:

    ngtoast
    
After this, `modules.js` folder will appear in `./public` folder (`output` parameter in configuration file).

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

    angular
        .module(module.name, module.dependencies.concat('ui.router'))
        .config(['$stateProvider', function(stateProvider){
            stateProvider
                .state(module.name, {
                    url: [module url],
                    templateUrl: module.path + 'views/[view name]',
                    controller: module.name + '.c.[controller name]' // controller name is prefixed to avoid conflict
                });
        }]);
        
Example (`[module]/controllers/[controller name]/index.js`):

    angular.module(module.name).controller(module.name + '.c.' + current.name, ['$scope', function(scope){
        ...
    }]);
    
Directives act same way.





