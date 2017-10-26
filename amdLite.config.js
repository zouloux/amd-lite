/**
 * AmdLite configuration file example.
 * This file needs to be after amdLite.js or amdLite.min.js.
 *
 * IMPORTANT : init amdLite AFTER not optimized AMD modules. OR enable ignoreNotOptimized option. OR set amdObject to null.
 * IMPORTANT : init amdLite BEFORE optimized AMD modules or they will be ignored.
 */
amdLite.init({

	/**
	 * Ignore when a not optimized AMD module tries to define itself.
	 * Default is strict so an error will be thrown.
	 *
	 * More info about AMD optimization :
	 * @see https://github.com/zouloux/amd-lite#optimization
	 * @see http://requirejs.org/docs/optimization.html
	 */
	ignoreNotOptimized : false,

	/**
	 * Allow an AMD module to override another one if it has the same path.
	 * Default is strict so an error will be thrown.
	 */
	allowOverride : false,

	/**
	 * Allow console logging.
	 *
	 * 0 -> Quiet mode
	 * Nothing will show, but errors can be thrown.
	 *
	 * 1 -> (Default) Warning mode :
	 * Console will warn if :
	 * - a module is overridden
	 * - a not optimized module tries to define itself
	 *
	 * 2 -> Dev mod :
	 * Every require or define will be logged.
	 * For debugging purpose.
	 */
	verbosity: 1,

	/**
	 * Modules names mapped to global dependencies.
	 *
	 * For example you can map :
	 * "react" : "React"
	 * "react-dom" : "ReactDOM"
	 *
	 * With this configuration, when module "react" is required,
	 * "React" from public scope will be served.
	 *
	 * Really handy for non AMD compatible libraries or not optimised modules.
	 */
	globalDependencies: {
		'react' 	: 'React',
		'react-dom' : 'ReactDOM',
		'three' 	: 'THREE'
	},

	/**
	 * Namespaces are useful to map globally available libraries to another name.
	 *
	 * For example:
	 * GSAP lib is globally available as "GreenSockGlobals"
	 * but its typescript definition is looking for "gsap".
	 *
	 * You can add this entry :
	 * "gsap" : "GreenSockGlobals"
	 * and "gsap" will be added to global scope, pointing to "GreenSockGlobals"
	 */
	namespaces : {
		'gsap' 		: 'GreenSockGlobals'
	},

	/**
	 * AMD Object injected onto define method.
	 * This is the define.amd object.
	 *
	 * Useful so UMD libraries know if they can inject themselves with define.
	 *
	 * Default is null, so UMD modules will not use define to inject themselves.
	 * Generally, UMD modules are not optimized so this is what we want.
	 *
	 * Also, {jquery: true} can work for most of cases.
	 */
	amdObject: null
});