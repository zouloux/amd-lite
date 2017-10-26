# AmdLite

Minimal AMD / RequireJS implementation.
**No plugins, no loaders, only module resolving.**


# Why ?

AMD modules are not simple to use, RequireJS and r.js api are heavy and complex. 
AmdLite is here to offer modular JS in the browser with a minimal footprint and configuration complexity.


### This script is for you if : 
- You want modular JS in your browser.
- You want to avoid loading libraries one at a time (HTTP2 push where are you?) for loading time optimization.
- You don't want to include the huge require.js file in your javascript. 
- You have a compiler (let say Typescript) which can prepare AMD modules for you.
- You don't need AMD plugins or RequireJS's library dynamic loading feature.
- You want advanced resources management like code-splitting and dependency injection.


# Usage

Include the [amdLite.js](amdLite.js) or [amdLite.min.js](amdLite.min.js) file in your bundle.
You can insert it at any level of your bundle because unless like RequireJS, this is not polluting global scope with require and define methods automatically.

Create a config file (here is an example : [amdLite.config.js](amdLite.config.js)).
Include this config file after not optimized libraries, but before optimized ones.

`amdLite` will be injected into the global scope. This will be the public API if you want to use advanced features.
Take a look at [amdLite.js](amdLite.js) to see how it works.


# Optimization

AmdLite **is only compatible** with optimized libraries.

An optimized module is a module with its path in the `define` statement :
- Not optimized : `define(['require', 'exports', 'react'], function () {...});`
- Optimized : `define('path/to/Module', ['require', 'exports', 'react'], function () {...});`

Not optimized modules are meant to be optimized with r.js (or the simpler [grunt-amd-compile](https://github.com/zouloux/grunt-amd-compile)).
They also can be loaded dynamically with XHR requests but this is not possible with amtLite, on purpose.


# Tested libraries

We tested with compiled code from Typescript for AMD modules.
Those modules were optimised with [grunt-amd-compile](https://github.com/zouloux/grunt-amd-compile)
Tested code was using these libraries as dependencies :
- gsap@1.20.3 (as global, mapped from 'GreenSockGlobals' to 'gsap', thanks to 'namespaces' amdLite option)
- jquery@3.2.1 (as global)
- pixi.js@4.5.6 (as global)
- react@16.0.0 (not optimized, with require from global, thanks to 'globalDependencies' amdLite option)
- react-dom@16.0.0 (not optimized, with require from global, thanks to 'globalDependencies' amdLite option)
- three@0.87.1 (not optimized, with require from global, thanks to 'globalDependencies' amdLite option)


# Links

- Read this really good article about modular JS : https://addyosmani.com/writing-modular-js/
- [Solid JS framework](https://github.com/solid-js/web-base) is a Typescript framework using AmdLite
- [grunt-amd-compile](https://github.com/zouloux/grunt-amd-compile) is an ultra simple AMD optimizer, used in Solid JS 
- [Almond](https://github.com/requirejs/almond) is the main inspiration for this script.
