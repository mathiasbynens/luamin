(function(root) {

	/** Detect free variable `exports` */
	var freeExports = typeof exports == 'object' && exports;

	/** Detect free variable `module` */
	var freeModule = typeof module == 'object' && module &&
		module.exports == freeExports && module;

	/** Detect free variable `global` and use it as `root` */
	var freeGlobal = typeof global == 'object' && global;
	if (freeGlobal.global === freeGlobal) {
		root = freeGlobal;
	}

	var luaparse = root.luaparse || require('luaparse');
	luaparse.defaultOptions.comments = false;
	luaparse.defaultOptions.scope = true;
	var parse = luaparse.parse;

	var regexAlphaUnderscore = /[a-zA-Z_]/;
	var regexDigits = /[0-9]/;

	var PRECEDENCE = {
		// http://www.lua.org/manual/5.2/manual.html#3.4.7
		// http://www.lua.org/source/5.2/lparser.c.html#priority
		'or': 1,
		'and': 2,
		'<': 3, '>': 3, '<=': 3, '>=': 3, '~=': 3, '==': 3,
		'..': 5,
		'+': 6, '-': 6, // binary -
		'*': 7, '/': 7, '%': 7,
		'unarynot': 8, 'unary#': 8, 'unary-': 8, // unary -
		'^': 10
	};

	var IDENTIFIER_PARTS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a',
		'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p',
		'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E',
		'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T',
		'U', 'V', 'W', 'X', 'Y', 'Z', '_'];
	var IDENTIFIER_PARTS_MAX_POS = IDENTIFIER_PARTS.length - 1;

	var generateZeroes = function(length) {
		return Array(length + 1).join('0');
	};

	var currentIdentifier;
	var identifierMap;
	var hasOwnProperty = {}.hasOwnProperty;
	var generateIdentifier = function(originalName) {
		if (hasOwnProperty.call(identifierMap, originalName)) {
			return identifierMap[originalName];
		}
		var length = currentIdentifier.length;
		var position = length - 1;
		var character;
		var index;
		while (position >= 0) {
			character = currentIdentifier.charAt(position);
			index = IDENTIFIER_PARTS.indexOf(character);
			if (index != IDENTIFIER_PARTS_MAX_POS) {
				currentIdentifier = currentIdentifier.substring(0, position) +
					IDENTIFIER_PARTS[index + 1] + generateZeroes(length - (position + 1));
					identifierMap[originalName] = currentIdentifier;
				return currentIdentifier;
			}
			--position;
		}
		currentIdentifier = 'a' + generateZeroes(length);
		identifierMap[originalName] = currentIdentifier;
		return currentIdentifier;
	};

	var joinStatements = function(a, b, separator) {
		separator || (separator = ' ');

		var lastCharA = a.slice(-1);
		var firstCharB = b.slice(0, 1);

		if (regexAlphaUnderscore.test(lastCharA)) {
			if (!(regexAlphaUnderscore.test(firstCharB) || regexDigits.test(firstCharB))) {
				// `firstCharB` is a symbol; it's safe to join without a separator
				return a + b;
			} else {
				// prevent ambiguous syntax
				return a + separator + b;
			}
		} else if (regexDigits.test(lastCharA)) {
			if (firstCharB == '(' || (firstCharB != '.' && !regexAlphaUnderscore.test(firstCharB))) {
				// e.g. `1(` or `1-`
				return a + b;
			} else {
				return a + separator + b;
			}
		} else if (lastCharA == '') {
			return a + b;
		} else if (!regexAlphaUnderscore.test(lastCharA) && (firstCharB == '(' || regexDigits.test(firstCharB))) {
			return a + b;
		} else if (firstCharB == '(' || (lastCharA == firstCharB && lastCharA == '-')) {
			return a + separator + b;
		} else {
			return a + b;
		}
	};

	var formatExpression = function(expression, precedence) {

		precedence || (precedence = 0);

		var result = '';
		var currentPrecedence;
		var operator;

		var expressionType = expression.type;

		if (expressionType == 'Identifier') {

			result = expression.isLocal ? generateIdentifier(expression.name) : expression.name;

		} else if (
			expressionType == 'NumericLiteral' ||
			expressionType == 'BooleanLiteral' ||
			expressionType == 'NilLiteral' ||
			expressionType == 'StringLiteral' ||
			expressionType == 'VarargLiteral'
		) {

			result = expression.raw;

		} else if (
			expressionType == 'LogicalExpression' ||
			expressionType == 'BinaryExpression'
		) {

			// If an expression with precedence x
			// contains an expression with precedence < x,
			// the inner expression must be wrapped in parens.
			operator = expression.operator;
			currentPrecedence = PRECEDENCE[operator];

			result = formatExpression(expression.left, currentPrecedence);
			result = joinStatements(result, operator);
			result = joinStatements(result, formatExpression(expression.right));

			if (operator == '^' || operator == '..') {
				currentPrecedence--;
			}

			if (currentPrecedence < precedence) {
				result = '(' + result + ')';
			}

		} else if (expressionType == 'UnaryExpression') {

			operator = expression.operator;
			currentPrecedence = PRECEDENCE['unary' + operator];

			result = joinStatements(operator, formatExpression(expression.argument, currentPrecedence));

			if (currentPrecedence < precedence) {
				result = '(' + result + ')';
			}

		} else if (expressionType == 'CallExpression') {

			result = formatExpression(expression.base) + '(';

			result += expression.arguments.map(function(argument) {
				return formatExpression(argument);
			}).join(',');
			result += ')';

		} else if (expressionType == 'TableCallExpression') { // e.g. `foo{1,2,3}`

			result = formatExpression(expression.base) + formatExpression(expression.arguments);

		} else if (expressionType == 'StringCallExpression') { // e.g. `foo'lol'`

			result = formatExpression(expression.base) + formatExpression(expression.argument);

		} else if (expressionType == 'IndexExpression') { // e.g. `x[2]`

			result = formatExpression(expression.base) + '[' + formatExpression(expression.index) + ']';

		} else if (expressionType == 'MemberExpression') { // e.g. `x:sub(1, 1)`

			result = formatExpression(expression.base) + expression.indexer + formatExpression(expression.identifier);

		} else if (expressionType == 'FunctionDeclaration') {

			result = 'function(';
			if (expression.parameters.length) {
				result += expression.parameters.map(function(parameter) {
					// `Identifier`s have a `name`, `VarargLiteral`s have a `value`
					return parameter.name || parameter.value;
				}).join(',');
			}
			result += ')';
			result = joinStatements(result, formatStatementList(expression.body));
			result = joinStatements(result, 'end');

		} else if (expressionType == 'TableConstructorExpression') {

			result = '{';

			var fields = expression.fields;
			var length = fields.length - 1;
			fields.forEach(function(field, index) {
				if (field.type == 'TableKey') {
					result += '[' + formatExpression(field.key) + ']=' + formatExpression(field.value);
				} else if (field.type == 'TableValue') {
					result += formatExpression(field.value);
				} else if (field.type == 'TableKeyString') {
					result += formatExpression(field.key) + '=' + formatExpression(field.value);
				}
				if (index < length) {
					result += ',';
				}
			});

			result += '}';

		} else {

			throw Error('Unknown expression type: ' + expressionType);

		}

		return result;
	};

	var formatStatementList = function(body) {
		var result = '';
		body.forEach(function(statement) {
			result = joinStatements(result, formatStatement(statement), ';');
		});
		return result;
	};

	var formatStatement = function(statement) {
		var result = '';
		var statementType = statement.type;

		if (statementType == 'AssignmentStatement') {

			// left-hand side
			result = statement.variables.map(function(variable) {
				return formatExpression(variable);
			}).join(',');

			// right-hand side
			result += '=';
			result += statement.init.map(function(init) {
				return formatExpression(init);
			}).join(',');

		} else if (statementType == 'LocalStatement') {

			result = 'local ';

			// left-hand side
			result += statement.variables.map(function(variable) {
				// Variables in a `LocalStatement` are always local, duh
				return generateIdentifier(variable.name);
			}).join(',');

			// right-hand side
			if (statement.init.length) {
				result += '=';
				result += statement.init.map(function(init) {
					return formatExpression(init);
				}).join(',');
			}

		} else if (statementType == 'CallStatement') {

			result = formatExpression(statement.expression);

		} else if (statementType == 'IfStatement') {

			result = joinStatements('if', formatExpression(statement.clauses[0].condition));
			result = joinStatements(result, 'then');
			result = joinStatements(result, formatStatementList(statement.clauses[0].body));
			statement.clauses.slice(1).forEach(function(clause) {
				if (clause.condition) {
					result = joinStatements(result, 'elseif');
					result = joinStatements(result, formatExpression(clause.condition));
					result = joinStatements(result, 'then');
				} else {
					result = joinStatements(result, 'else');
				}
				result = joinStatements(result, formatStatementList(clause.body));
			});
			result = joinStatements(result, 'end');

		} else if (statementType == 'WhileStatement') {

			result = joinStatements('while', formatExpression(statement.condition));
			result = joinStatements(result, 'do');
			result = joinStatements(result, formatStatementList(statement.body));
			result = joinStatements(result, 'end');

		} else if (statementType == 'DoStatement') {

			result = joinStatements('do', formatStatementList(statement.body));
			result = joinStatements(result, 'end');

		} else if (statementType == 'ReturnStatement') {

			result = 'return';

			var args = statement.arguments;
			var length = args.length - 1;
			args.forEach(function(argument, index) {
				result = joinStatements(result, formatExpression(args[index])) + (index < length ? ',' : '');
			});

		} else if (statementType == 'BreakStatement') {

			result = 'break';

		} else if (statementType == 'RepeatStatement') {

			result = joinStatements('repeat', formatStatementList(statement.body));
			result = joinStatements(result, 'until');
			result = joinStatements(result, formatExpression(statement.condition))

		} else if (statementType == 'FunctionDeclaration') {

			result = (statement.isLocal ? 'local ' : '') + 'function ';
			result += formatExpression(statement.identifier);
			result += '(';

			if (statement.parameters.length) {
				result += statement.parameters.map(function(parameter) {
					// `Identifier`s have a `name`, `VarargLiteral`s have a `value`
					return parameter.name || parameter.value;
				}).join(',');
			}

			result += ')';
			result = joinStatements(result, formatStatementList(statement.body));
			result = joinStatements(result, 'end');

		} else if (statementType == 'ForGenericStatement') { // see also `ForNumericStatement`

			result = 'for ';

			var variables = statement.variables;
			var length = variables.length - 1;
			variables.forEach(function(variable, index) {
				// The variables in a `ForGenericStatement` are always local
				result += generateIdentifier(variable.name) + (index < length ? ',' : '');
			});

			result += ' in';

			var iterators = statement.iterators;
			var length = iterators.length - 1;
			iterators.forEach(function(iterator, index) {
				result = joinStatements(result, formatExpression(iterator));
				if (index < length) {
					result += ',';
				}
			});

			result = joinStatements(result, 'do');
			result = joinStatements(result, formatStatementList(statement.body));
			result = joinStatements(result, 'end');

		} else if (statementType == 'ForNumericStatement') {

			// The variables in a `ForNumericStatement` are always local
			result = 'for ' + generateIdentifier(statement.variable.name) + '=';
			result += formatExpression(statement.start) + ',' + formatExpression(statement.end);

			if (statement.step) {
				result += ',' + formatExpression(statement.step);
			}

			result = joinStatements(result, 'do');
			result = joinStatements(result, formatStatementList(statement.body));
			result = joinStatements(result, 'end');

		} else if (statementType == 'LabelStatement') {

			// The identifier names in a `LabelStatement` can always safely be renamed
			result = '::' + generateIdentifier(statement.label.name) + '::';

		} else if (statementType == 'GotoStatement') {

			// The identifier names in a `GotoStatement` can always safely be renamed
			result = 'goto ' + generateIdentifier(statement.label.name);

		} else {

			throw Error('Unknown AST type: ' + statementType);

		}

		return result;
	};

	var minify = function(code) {
		var ast = parse(code);

		// (Re)set temporary identifier values
		identifierMap = {};
		// This is a shortcut to help generate the first identifier (`a`) faster
		currentIdentifier = '9';

		// Make sure global variable names aren't renamed
		ast.globals.forEach(function(name) {
			identifierMap[name] = name;
		});

		return formatStatementList(ast.body);
	};

	// Expose luamin
	var luamin = {
		'version': '0.1.0',
		'minify': minify
	};

	// Some AMD build optimizers, like r.js, check for specific condition patterns like the following:
	if (typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
		define(function() {
			return luamin;
		});
	}
	// Check for `exports` after `define` in case a build optimizer adds an `exports` object
	else if (freeExports && !freeExports.nodeType) {
		if (freeModule) { // in Node.js or RingoJS v0.8.0+
			freeModule.exports = luamin;
		} else { // in Narwhal or RingoJS v0.7.0-
			for (var key in luamin) {
				luamin.hasOwnProperty(key) && (freeExports[key] = luamin[key]);
			}
		}
	} else { // in Rhino or a web browser
		root.luamin = luamin;
	}

}(this));
