/**
 * Do not pollute public scope by default
 */
(function (root)
{
	/**
	 * Public scope
	 */
	var that = {

		// --------------------------------------------------------------------- LOCAL PROPERTIES

		/**
		 * Modules that are already required and initialised.
		 */
		readyModules: [],

		/**
		 * Modules defined but never required yet.
		 * Every item contains a callback and dependency list.
		 * Required modules are removed from this list and added to the readyModules list.
		 */
		waitingModules : [],


		// --------------------------------------------------------------------- CONFIG PROPERTIES

		/**
		 * Public scope where require API is injected and where from global dependencies are retrieved.
		 * Can be changed if you work in a Node or specific environment.
		 * Default is self or this (window in browsers).
		 */
		publicScope: root,

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
		 * "react" 		: "React"
		 * "react-dom" 	: "ReactDOM"
		 *
		 * With this configuration, when module "react" is required,
		 * "React" from public scope will be served.
		 *
		 * Really handy for non AMD compatible libraries or not optimised modules.
		 */
		globalDependencies : { },

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
		namespaces : {},

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
		amdObject: null,


		// --------------------------------------------------------------------- INIT

		/**
		 * Init AMD Lite API.
		 * IMPORTANT : init amdLite AFTER not optimized AMD modules. OR enable ignoreNotOptimized option. OR set amdObject to null.
		 * IMPORTANT : init amdLite BEFORE optimized AMD modules or they will be ignored.
		 *
		 * Those options are available and will override properties on amdLite object :
		 * - publicScope
		 * - verbosity
		 * - ignoreNotOptimized
		 * - allowOverride
		 * - globalDependencies
		 * - namespaces
		 * - amdObject
		 *
		 * @param options Can override some properties on amdLite object.
		 */
		init : function (options)
		{
			// Default options bag
			options = (options || {});

			// Override default options.
			if ('publicScope' in options)			that.publicScope = options.publicScope;
			if ('verbosity' in options) 			that.verbosity = options.verbosity;
			if ('ignoreNotOptimized' in options) 	that.ignoreNotOptimized = options.ignoreNotOptimized;
			if ('allowOverride' in options) 		that.allowOverride = options.allowOverride;
			if ('globalDependencies' in options)	that.globalDependencies = options.globalDependencies;
			if ('namespaces' in options)			that.namespaces = options.namespaces;
			if ('amdObject' in options)				that.amdObject = options.amdObject;

			// Inject amd lite API into public scope.
			this._injectPublicAPI()
		},

		/**
		 * Inject RequireJS public API into public scope.
		 * Do not call directly.
		 * @private
		 */
		_injectPublicAPI : function ()
		{
			// Set requirejs and require methods
			that.publicScope['requirejs'] = that.publicScope['require'] = that.require;

			// Expose ready defined modules onto requirejs for maximum compatibility
			that.publicScope['requirejs']._defined = that.readyModules;

			// Expose define method
			that.publicScope['define'] = that.define;

			// Expose AMD object
			if (that.amdObject != null)
			{
				that.publicScope['define'].amd = that.amdObject;
			}

			// Expose namespaces to global scope
			for (var i in that.namespaces)
			{
				that.publicScope[ i ] = that.publicScope[ that.namespaces[ i ] ];
			}
		},


		// --------------------------------------------------------------------- REQUIRE JS PUBLIC API
		// Here are require JS lite public methods.

		/**
		 * Require a registered module.
		 * @param dependencyNames Array of name or path of the dependencies (as strings). Ex : ["react", "my/other/Lib"]
		 * @param callback Called when dependencies are ready. In amdLite implementation, this is always sync, so no delay.
		 * @param from From which path, dependencies are. Ex, if a dependency name is like "../my/Lib", because its called from "folder/OtherLib", you need to specify that "OtherLib" is inside "folder/". So here "from" will be "folder/".
		 */
		require: function (dependencyNames, callback, from)
		{
			// Require dependencies from root if no origin is given
			from = (from || '');

			// Verbose log
			(that.verbosity >= 2) && console.info('amdLite.require', dependencyNames, from);

			// Get dependencies
			var dependencies = that.resolveDependencies(dependencyNames, from);

			// Call back with dependencies
			callback.apply( null, dependencies );
		},

		/**
		 * Register an AMD module. Same API as the native RequireJS implementation.
		 * Only optimized modules.
		 * @param name Name or path of the dependency. Can be "react" or "lib/my/Dependency". No extension.
		 * @param dependencies List of dependencies needed (as strings) for this module to work. Ex : ["react", "my/other/Lib"]
		 * @param callback Private scope where module's code is. Use "exports" dependency to store public API or return statement.
		 */
		define: function (name, dependencies, callback)
		{
			// First argument needs to be a string
			if (typeof name !== 'string')
			{
				// If not, we are on a not optimized module
				var message = 'amdLite.define // Not optimized AMD module detected.';
				message += '\n@see https://github.com/zouloux/amd-lite#optimization';
				message += '\n@see http://requirejs.org/docs/optimization.html';

				// Show message
				if (!that.ignoreNotOptimized)
					throw new Error( message );
				else if (that.verbosity >= 1)
					console.warn( message );

				// Stop define
				return;
			}

			// Check if a module is already registered with this name/path
			if (name in that.waitingModules || name in that.readyModules)
			{
				// If we allow overrides
				if (that.allowOverride)
				{
					// Delete everything we got about the previous registered module
					delete that.readyModules[ name ];
					delete that.waitingModules[ name ];

					// Log warning about prevented override
					(that.verbosity >= 1) && console.warn('amdLite.define // Module ' + name + ' overridden');
				}

				// Throw error about prevented override
				else throw new Error('amdLite.define // Module ' + name + ' is already defined.');
			}

			// Add module to waiting modules list
			that.waitingModules[ name ] = {
				dependencies: dependencies,
				callback: callback
			};

			// Verbose log
			(that.verbosity >= 2) && console.info('amdLite.define //', name, dependencies);
		},


		// --------------------------------------------------------------------- HELPERS
		// Helper methods.

		/**
		 * Given a relative module name, like ./something, normalize it to
		 * a real name that can be mapped to a path.
		 *
		 * @see https://github.com/requirejs/almond/blob/master/almond.js
		 *
		 * @param {String} name the relative name
		 * @param {String} baseName a real name that the name arg is relative to.
		 * @returns {String} normalized name
		 */
		normalizeModuleName : function (name, baseName)
		{
			var i, part, normalizedBaseParts;
			var baseParts = baseName && baseName.split('/');

			//Adjust any relative paths.
			if (name) {
				name = name.split('/');

				// Starts with a '.' so need the baseName
				if (name[0].charAt(0) === '.' && baseParts) {
					//Convert baseName to array, and lop off the last part,
					//so that . matches that 'directory' and not name of the baseName's
					//module. For instance, baseName of 'one/two/three', maps to
					//'one/two/three.js', but we want the directory, 'one/two' for
					//this normalization.
					normalizedBaseParts = baseParts.slice(0, baseParts.length - 1);
					name = normalizedBaseParts.concat(name);
				}

				//start trimDots
				for (i = 0; i < name.length; i++) {
					part = name[i];
					if (part === '.') {
						name.splice(i, 1);
						i -= 1;
					} else if (part === '..') {
						// If at the start, or previous value is still ..,
						// keep them so that when converted to a path it may
						// still work when converted to a path, even though
						// as an ID it is less than ideal. In larger point
						// releases, may be better to just kick out an error.
						if (i === 0 || (i === 1 && name[2] === '..') || name[i - 1] === '..') {
							continue;
						} else if (i > 0) {
							name.splice(i - 1, 2);
							i -= 2;
						}
					}
				}
				//end trimDots

				name = name.join('/');
			}

			return name;
		},


		// --------------------------------------------------------------------- DEPENDENCIES RESOLVING
		// Here we tries to convert a dependency name to modules .

		/**
		 * Get defined modules from relative dependency names.
		 *
		 * Ex : resolveDependencies(['my/dependency/', 'react'])
		 * Will return an array of defined modules from those names.
		 *
		 * @param dependencyNames Dependency names relatives from "from" argument
		 * @param from Original path from where to require.
		 * @return an array of defined modules.
		 */
		resolveDependencies : function ( dependencyNames, from )
		{
			// Browse dependency names
			return dependencyNames.map( function (dependencyName)
			{
				// Normalize path from root
				var dependencyPath = that.normalizeModuleName( dependencyName, from );

				// Get dependency instance
				var dependencyInstance = that.resolveDependency( dependencyPath );

				// If this dependency is not found
				if (dependencyInstance == null)
				{
					var message = 'amdLite.resolveDependencies // Module ' + dependencyPath + ' not found.';
					if (that.strict)
						throw new Error( message );
					else if (that.verbosity >= 1)
						console.warn( message );
				}

				// Return required dependency instance
				return dependencyInstance;
			});
		},

		/**
		 * Resolve a dependency from its path.
		 *
		 * Will check if path is :
		 * - a special case (1)
		 * - a global dependency
		 * - a ready module
		 * - a waiting module (2)
		 *
		 * (1) Special cases :
		 * - "require" will resolve to require method.
		 * - "exports" will resolve to a new empty object (for exports statements)
		 *
		 * (2) If module is in waiting list, module will be initialized and will go to
		 * the ready modules list.
		 *
		 * @param dependencyPath Absolute path to the dependency. Path needs to be normalized at this point.
		 * @throws Error if exports statement not found when initializing module.
		 * @returns Found module public API.
		 */
		resolveDependency : function (dependencyPath)
		{
			// Special case : require
			if (dependencyPath == 'require')
			{
				return require;
			}

			// Special case : exports statement
			else if (dependencyPath == 'exports')
			{
				return {};
			}

			// Check if module is a global dependency
			else if (dependencyPath in that.globalDependencies)
			{
				// Get global dependency name
				var dependencyGlobalName = that.globalDependencies[ dependencyPath ];

				return (
					// If this dependency is not in the global scope
					!(dependencyGlobalName in that.publicScope)
						? null

						// Return global module
						: that.publicScope[ dependencyGlobalName ]
				)
			}

			// Check if module is ready
			else if (dependencyPath in that.readyModules)
			{
				return that.readyModules[ dependencyPath ];
			}

			// Check if module is not ready but defined and in waiting list
			else if (dependencyPath in that.waitingModules)
			{
				// Get module building info from waiting list
				var moduleToBuild = that.waitingModules[ dependencyPath ];

				// Resolve waiting module dependencies recursively
				var dependencies = that.resolveDependencies(
					moduleToBuild.dependencies,
					dependencyPath
				);

				// Call module callback with resolved dependencies
				var callbackReturn = moduleToBuild.callback.apply( null, dependencies );

				// Get index for exports statement
				var exportsIndex = moduleToBuild.dependencies.indexOf('exports');

				// We try to get module public API.
				// It can be inside "exports" parameter or in callback return statement.
				var buildModule = (

					// No export, we return the callback return for maximum compatibility
					// Can be null
					(exportsIndex === -1)
					? callbackReturn

					// Retrieve exports object from its index
					// Module public API is this very object
					// Can't be null but can be empty
					: dependencies[ exportsIndex ]
				)

				// Register this module as ready
				that.readyModules[ dependencyPath ] = buildModule;
				delete that.waitingModules[ dependencyPath ];

				// Return module
				return buildModule;
			}

			// Not found
			else return null;
		}
	};

	// ------------------------------------------------------------------------- UMD & AUTO INIT

	// If we have an exports object (Node env for example)
	if (typeof exports === 'object' && typeof exports.nodeName !== 'string')
	{
		// Do not pollute global scope and add public API on exports object
		exports.amdLite = that;
	}

	// Else, we certainly are inside a browser (most cases)
	else
	{
		// So we pollute the global scope
		root.amdLite = that;
	}

	// Auto init if we have an amdLiteConfig object available in global scope
	if (typeof amdLiteConfig === 'object')
	{
		that.init( amdLiteConfig );
	}
})

// Auto call with default public scope
( typeof self !== 'undefined' ? self : this );