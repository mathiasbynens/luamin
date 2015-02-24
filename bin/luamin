#!/usr/bin/env node
(function() {

	var fs = require('fs');
	var luamin = require('../luamin.js');
	var minify = luamin.minify;
	var snippets = process.argv.splice(2);
	var option = snippets.shift();
	var isFile = false;
	var isAST = false;
	var stdin = process.stdin;
	var data;
	var log = console.log;
	var main = function() {

		if (/^(?:-h|--help|undefined)$/.test(option)) {
			log('luamin v%s - https://mths.be/luamin', luamin.version);
			log([
				'\nUsage:\n',
				'\tluamin [-c | --code] [snippet ...]',
				'\tluamin [-f | --file] [file ...]',
				'\tluamin [-a | --ast] [AST ...]',
				'\tluamin [-v | --version]',
				'\tluamin [-h | --help]',
				'\nExamples:\n',
				'\tluamin -c \'a = ((1 + 2) - 3) * (4 / (5 ^ 6))\'',
				'\tluamin -f foo.lua',
				'\techo \'a = "foo" .. "bar"\' | luamin -c',
				'\tluaparse --scope \'a = 42\' | luamin -a'
			].join('\n'));
			return process.exit(1);
		}

		if (/^(?:-v|--version)$/.test(option)) {
			log('v%s', luamin.version);
			return process.exit(1);
		}

		if (/^(?:-f|--file)$/.test(option)) {
			isFile = true;
		} else if (/^(?:-a|--ast)$/.test(option)) {
			isAST = true;
		} else if (!/^(?:-c|--code)$/.test(option)) {
			log('Unrecognized option `%s`.', option);
			log('Try `luamin --help` for more information.');
			return process.exit(1);
		}

		if (!snippets.length) {
			log('Error: option `%s` requires an argument.', option);
			log('Try `luamin --help` for more information.');
			return process.exit(1);
		}

		snippets.forEach(function(snippet) {
			var result;
			if (isFile) {
				try {
					snippet = fs.readFileSync(snippet, 'utf8');
				} catch(error) {
					log('Error: no such file. (`%s`)', snippet);
					return process.exit(1);
				}
			}
			try {
				if (isAST) {
					snippet = JSON.parse(snippet);
				}
				result = minify(snippet);
				log(result);
			} catch(error) {
				log(error.message + '\n');
				if (isAST) {
					log('Error: failed to minify. Make sure the AST contains a ' +
						'`globals` property and is');
					log('fully compatible with luaparse.');
				} else { // it’s a snippet or an AST
					log('Error: failed to minify. Make sure the Lua code is valid.');
				}
				log('If you think this is a bug in luamin, please report it:');
				log('https://github.com/mathiasbynens/luamin/issues/new');
				log(
					'\nStack trace using luamin@%s and luaparse@%s:\n',
					luamin.version,
					require('luaparse').version
				);
				log(error.stack);
				return process.exit(1);
			}
		});
		// Return with exit status 0 outside of the `forEach` loop, in case
		// multiple snippets or files were passed in.
		return process.exit(0);

	};

	if (stdin.isTTY) {
		// handle shell arguments
		main();
	} else {
		// handle pipe
		data = '';
		stdin.on('data', function(chunk) {
			data += chunk;
		});
		stdin.on('end', function() {
			snippets.unshift(data.trim());
			main();
		});
		stdin.resume();
	}

}());
