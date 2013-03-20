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
	var currentPrecedence;
	var operator;

	var expressionType = expression.type;

	if (expressionType == 'Identifier') {

		result += expression.name;

	} else if (
		expressionType == 'NumericLiteral' ||
		expressionType == 'BooleanLiteral' ||
		expressionType == 'NilLiteral' ||
		expressionType == 'StringLiteral' ||
		expressionType == 'VarargLiteral'
	) {

		result += expression.raw;

	} else if (
		expressionType == 'LogicalExpression' ||
		expressionType == 'BinaryExpression'
	) {

		// if an expression with precedence x
		// contains an expression with precedence < x,
		// the inner expression must be wrapped in parens

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

		result += formatExpression(expression.base);
		result += '(';

		result += expression.arguments.map(function(argument) {
			return formatExpression(argument);
		}).join(',');
		result += ')';

	} else if (expressionType == 'TableCallExpression') { // e.g. `foo{1,2,3}`

		result += formatExpression(expression.base);
		result += formatExpression(expression.arguments);

	} else if (expressionType == 'StringCallExpression') { // e.g. `foo'lol'`

		result += formatExpression(expression.base) + formatExpression(expression.argument);

	} else if (expressionType == 'IndexExpression') { // e.g. `x[2]`

		result += formatExpression(expression.base) + '[' + formatExpression(expression.index) + ']';

	} else if (expressionType == 'MemberExpression') { // e.g. `x:sub(1, 1)`

		result += formatExpression(expression.base) + expression.indexer + formatExpression(expression.identifier);

	} else if (expressionType == 'FunctionDeclaration') {

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
		result = joinStatements(result, 'end');

	} else if (expressionType == 'TableConstructorExpression') {

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
			return variable.name;
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

		obfuscateVariables(statement);

		result = (statement.local ? 'local ' : '') + 'function ';
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

	} else if (statementType == 'ForNumericStatement') {

		result = 'for ' + statement.variable.name + '=';
		result += formatExpression(statement.start) + ',' + formatExpression(statement.end);

		if (statement.step) {
			result += ',' + formatExpression(statement.step);
		}

		result = joinStatements(result, 'do');
		result = joinStatements(result, formatStatementList(statement.body));
		result = joinStatements(result, 'end');

	} else if (statementType == 'LabelStatement') {

		result = '::' + statement.label.name + '::';

	} else if (statementType == 'GotoStatement') {

		result = 'goto ' + statement.label.name;

	} else {

		throw Error('Unknown AST type: ' + statementType);

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
	'version': '0.0.0-alpha',
	'minify': minify
};
