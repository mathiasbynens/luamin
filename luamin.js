// <temporary-stuff>
var util = require('util');
var log = function() {
	console.log(
		util.inspect(
			[].slice.call(arguments),
			{
				'showHidden': false,
				'depth': null,
				'colors': true
			}
		)
	);
};
// </temporary-stuff>

var parser = require('luaparse');

var regexAlphaUnderscore = /[a-zA-Z_]/;
var regexDigits = /[0-9]/;

var Precedence = {
	// http://www.lua.org/manual/5.1/manual.html#2.5.6
	'or': 1,
	'and': 2,
	'<': 3, '>': 3, '<=': 3, '>=': 3, '~=': 3, '==': 3,
	'..': 4,
	'+': 5, '-': 5, // binary -
	'*': 6, '/': 6, '%': 6,
	'unarynot': 7, 'unary#': 7, 'unary-': 7, // unary -
	'^': 8
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

var obfuscateVariables = function(expression) {
	// TODO
	// both in expression.body and expression.parameters
	return expression;
};

var formatExpression = function(expression, precedence) {

	precedence || (precedence = 0);

	var result = '';
	var tmp = '';
	var currentPrecedence;

	if (expression.type == 'Identifier') {

		result += expression.name;

	} else if (
		expression.type == 'NumericLiteral' ||
		expression.type == 'BooleanLiteral' ||
		expression.type == 'NilLiteral' ||
		expression.type == 'StringLiteral' ||
		expression.type == 'VarargLiteral'
	) {

		result += expression.raw;

	} else if (
		expression.type == 'LogicalExpression' ||
		expression.type == 'BinaryExpression'
	) {

		// if an expression with precedence x
		// contains an expression with precedence < x,
		// the inner expression must be wrapped in parens

		currentPrecedence = Precedence[expression.operator];

		result = formatExpression(expression.left, currentPrecedence);
		result = joinStatements(result, expression.operator);
		result = joinStatements(result, formatExpression(expression.right));

		if (currentPrecedence < precedence) {
			result = '(' + result + ')';
		}

	} else if (expression.type == 'UnaryExpression') {

		currentPrecedence = Precedence['unary' + expression.operator];

		result = joinStatements(result, expression.operator);
		result = joinStatements(result, formatExpression(expression.argument, currentPrecedence));

		if (currentPrecedence < precedence) {
			result = '(' + result + ')';
		}

	} else if (expression.type == 'CallExpression') {

		result += formatExpression(expression.base);
		result += '(';

		result += expression['arguments'].map(function(argument) {
			return formatExpression(argument);
		}).join(',');
		result += ')';

	} else if (expression.type == 'TableCallExpression') { // e.g. `foo{1,2,3}`

		result += formatExpression(expression.base);
		result += formatExpression(expression['arguments']);

	} else if (expression.type == 'StringCallExpression') { // e.g. `foo'lol'`

		result += formatExpression(expression.base) + formatExpression(expression.argument);

	} else if (expression.type == 'IndexExpression') { // e.g. `x[2]`

		result += formatExpression(expression.base) + '[' + formatExpression(expression.index) + ']';

	} else if (expression.type == 'MemberExpression') { // e.g. `x:sub(1, 1)`

		result += formatExpression(expression.base) + expression.indexer + formatExpression(expression.identifier);

	} else if (expression.type == 'FunctionDeclaration') {

		obfuscateVariables(expression);

		result += 'function(';
		if (expression.parameters.length) {
			result += expression.parameters.map(function(parameter) {
				// `Identifier`s have a `name`, `VarargLiteral`s have a `value`
				return parameter.name || parameter.value;
			}).join(',');
		}
		result += ')';
		result = joinStatements(result, formatStatementList(expression.body));
		result += 'end';

	} else if (expression.type == 'TableConstructorExpression') {

		result += '{';

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

		log('Unknown expression type:', expression);
		throw Error('Unknown expression type');

	}

	return result;
};

var formatStatementList = function(body) {
	var result = '';
	obfuscateVariables(body);
	body.forEach(function(statement) {
		result = joinStatements(result, formatStatement(statement), ';');
	});
	return result;
};

var formatStatement = function(statement) {
	var result = '';

	if (statement.type == 'AssignmentStatement') {

		// left-hand side
		result = statement.variables.map(function(variable) {
			return formatExpression(variable);
		}).join(',');

		// right-hand side
		if (statement.init.length) {
			result += '=';
			result += statement.init.map(function(init) {
				return formatExpression(init);
			}).join(',');

		}

	} else if (statement.type == 'LocalStatement') {

		result = 'local ';

		// left-hand side
		result += statement.variables.map(function(variable) {
			return variable.name;
		}).join(',');

		// right-hand side
		if (statement.init.length) {
			result += '=';
			result += statement.init.map(function(init) {
				return formatExpression(init);
			}).join(',');
		}

	} else if (statement.type == 'CallStatement') {

		result = formatExpression(statement.expression);

	} else if (statement.type == 'IfStatement') {

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

	} else if (statement.type == 'WhileStatement') {

		result = joinStatements('while', formatExpression(statement.condition));
		result = joinStatements(result, 'do');
		result = joinStatements(result, formatStatementList(statement.body));
		result = joinStatements(result, 'end');

	} else if (statement.type == 'DoStatement') {

		result = joinStatements(result, 'do');
		result = joinStatements(result, formatStatementList(statement.body));
		result = joinStatements(result, 'end');

	} else if (statement.type == 'ReturnStatement') {

		result = 'return';

		var args = statement['arguments'];
		var length = args.length - 1;
		args.forEach(function(argument, index) {
			result = joinStatements(result, formatExpression(args[index])) + (index < length ? ',' : '');
		});

	} else if (statement.type == 'BreakStatement') {

		result = 'break';

	} else if (statement.type == 'RepeatStatement') {

		result = 'repeat';
		result = joinStatements(result, formatStatementList(statement.body));
		result = joinStatements(result, 'until');
		result = joinStatements(result, formatExpression(statement.condition))

	} else if (statement.type == 'FunctionDeclaration') {

		obfuscateVariables(statement);

		if (statement.local) {
			result = 'local';
		}

		result = joinStatements(result, 'function ');
		result += formatExpression(statement.identifier);
		result += '(';

		if (statement.parameters.length) {
			result += statement.parameters.map(function(parameter) {
				// `Identifier`s have a `name`, `VarargLiteral`s have a `value`
				return parameter.name || parameter.value;
			}).join(',');
			if (statement.vararg) {
				result += ',...';
			}
		} else {
			if (statement.vararg) {
				result += '...';
			}
		}

		result += ')';
		result = joinStatements(result, formatStatementList(statement.body));
		result = joinStatements(result, 'end');

	} else if (statement.type == 'ForGenericStatement') { // see also `ForNumericStatement`

		obfuscateVariables(statement);
		result = 'for ';

		var variables = statement.variables;
		var length = variables.length - 1;
		variables.forEach(function(variable, index) {
			result += variable.name + (index < length ? ',' : '');
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

	} else if (statement.type == 'ForNumericStatement') {

		result = 'for ';
		result += statement.variable.name + '=';
		result += formatExpression(statement.start) + ',' + formatExpression(statement.end);

		if (statement.step) {
			result += ',' + formatExpression(statement.step);
		}

		result = joinStatements(result, 'do');
		result = joinStatements(result, formatStatementList(statement.body));
		result = joinStatements(result, 'end');

	} else if (statement.type == 'LabelStatement') {

		result = '::' + statement.label.name + '::';

	} else if (statement.type == 'GotoStatement') {

		result = 'goto ' + statement.label.name;

	} else if (statement.type == 'Comment') {

		// do nothing

	} else {

		throw Error('Unknown AST type: ' + statement.type);

	}

	return result;
};

var minify = function(code) {
	var ast = parser.parse(code);
	//log(ast);
	var output = formatStatementList(ast.body);
	//log(output);
	return output;
};

module.exports = {
	'version': '0.0.1',
	'minify': minify
};
