(function(root) {
	'use strict';

	var noop = Function.prototype;

	var load = (typeof require == 'function' && !(root.define && define.amd)) ?
		require :
		(!root.document && root.java && root.load) || noop;

	var QUnit = (function() {
		return root.QUnit || (
			root.addEventListener || (root.addEventListener = noop),
			root.setTimeout || (root.setTimeout = noop),
			root.QUnit = load('../node_modules/qunitjs/qunit/qunit.js') || root.QUnit,
			addEventListener === noop && delete root.addEventListener,
			root.QUnit
		);
	}());

	var qe = load('../node_modules/qunit-extras/qunit-extras.js');
	if (qe) {
		qe.runInContext(root);
	}

	/** The `luaparse` utility function */
	var luaparse = root.luaparse || (root.luaparse = (
		luaparse = load('../node_modules/luaparse/luaparse.js') || root.luaparse,
		luaparse = luaparse.luaparse || luaparse
	));

	/** The `luamin` function to test */
	var luamin = root.luamin || (root.luamin = (
		luamin = load('../luamin.js') || root.luamin,
		luamin = luamin.luamin || luamin
	));
	var minify = luamin.minify;

	/*--------------------------------------------------------------------------*/

	var data = {

		// Assignments
		'Assignments': [
			{
				'description': 'AssignmentStatement',
				'original': 'a = 1, 2, 3',
				'minified': 'a=1,2,3'
			},
			{
				'description': 'AssignmentStatement',
				'original': 'a, b, c = 1',
				'minified': 'a,b,c=1'
			},
			{
				'description': 'AssignmentStatement',
				'original': 'a, b, c = 1, 2, 3',
				'minified': 'a,b,c=1,2,3'
			},
			{
				'description': 'AssignmentStatement + MemberExpression',
				'original': 'a.b = 1',
				'minified': 'a.b=1'
			},
			{
				'description': 'AssignmentStatement + MemberExpression',
				'original': 'a.b.c = 1',
				'minified': 'a.b.c=1'
			},
			{
				'description': 'AssignmentStatement + IndexExpression',
				'original': 'a[b] = 1',
				'minified': 'a[b]=1'
			},
			{
				'description': 'AssignmentStatement + IndexExpression',
				'original': 'a[b][c] = 1',
				'minified': 'a[b][c]=1'
			},
			{
				'description': 'AssignmentStatement + MemberExpression + IndexExpression',
				'original': 'a.b[c] = 1',
				'minified': 'a.b[c]=1'
			},
			{
				'description': 'AssignmentStatement + IndexExpression + MemberExpression',
				'original': 'a[b].c = 1',
				'minified': 'a[b].c=1'
			},
			{
				'description': 'AssignmentStatement + IndexExpression',
				'original': 'a[b], a[c] = 1',
				'minified': 'a[b],a[c]=1'
			}
		],

		// Comments
		'Comments': [
			{
				'description': 'Comment',
				'original': '-- comment',
				'minified': ''
			},
			{
				'description': 'Comment',
				'original': '-- comment\n-- comment',
				'minified': ''
			},
			{
				'description': 'Comment',
				'original': '--comment',
				'minified': ''
			},
			{
				'description': 'Comment + line break + BreakStatement',
				'original': '-- comment\nbreak',
				'minified': 'break'
			},
			{
				'description': 'BreakStatement + Comment',
				'original': 'break-- comment',
				'minified': 'break'
			},
			{
				'description': 'Comment',
				'original': '--[[comment]]--',
				'minified': ''
			},
			{
				'description': 'Comment + BreakStatement',
				'original': '--[[comment]]--\nbreak',
				'minified': 'break'
			},
			{
				'description': 'Comment + BreakStatement',
				'original': '--[=[comment]=]--\nbreak',
				'minified': 'break'
			},
			{
				'description': 'Comment + BreakStatement',
				'original': '--[===[comment\n--[=[sub]=]--\n]===]--\nbreak',
				'minified': 'break'
			},
			{
				'description': 'Multi-line Comment',
				'original': '--[[comment\nline two]]--',
				'minified': ''
			},
			{
				'description': 'Multi-line Comment',
				'original': '--[[\ncomment\nline two\n]]--',
				'minified': ''
			},
			{
				'description': 'Comment + BreakStatement',
				'original': '--[==\nbreak --]]--',
				'minified': 'break'
			},
			{
				'description': 'IfStatement + Comment',
				'original': 'if true -- comment\nthen end',
				'minified': 'if true then end'
			}
		],

		// Conditionals
		'Conditionals': [
			{
				'description': 'IfStatement',
				'original': 'if 1 then end',
				'minified': 'if 1 then end'
			},
			{
				'description': 'IfStatement + LocalStatement',
				'original': 'if 1 then local foo end',
				'minified': 'if 1 then local a end'
			},
			{
				'description': 'IfStatement + LocalStatement',
				'original': 'if 1 then local foo local bar end',
				'minified': 'if 1 then local a;local b end'
			},
			{
				'description': 'IfStatement + LocalStatement',
				'original': 'if 1 then local foo; local bar; end',
				'minified': 'if 1 then local a;local b end'
			},
			{
				'description': 'IfStatement + ElseClause',
				'original': 'if 1 then else end',
				'minified': 'if 1 then else end'
			},
			{
				'description': 'IfStatement',
				'original': 'if 1 then end',
				'minified': 'if 1 then end'
			},
			{
				'description': 'IfStatement + ElseClause + LocalStatement',
				'original': 'if 1 then local foo else local bar end',
				'minified': 'if 1 then local a else local b end'
			},
			{
				'description': 'IfStatement + ElseClause + LocalStatement',
				'original': 'if 1 then local foo; else local bar; end',
				'minified': 'if 1 then local a else local b end'
			},
			{
				'description': 'IfStatement + ElseifClause + LocalStatement',
				'original': 'if 1 then local foo elseif 2 then local bar end',
				'minified': 'if 1 then local a elseif 2 then local b end'
			},
			{
				'description': 'IfStatement + ElseifClause + LocalStatement',
				'original': 'if 1 then local foo; elseif 2 then local bar; end',
				'minified': 'if 1 then local a elseif 2 then local b end'
			},
			{
				'description': 'IfStatement + ElseifClause',
				'original': 'if 1 then elseif 2 then else end',
				'minified': 'if 1 then elseif 2 then else end'
			},
			{
				'description': 'Nested IfStatement',
				'original': 'if 1 then else if 2 then end end',
				'minified': 'if 1 then else if 2 then end end'
			},
			{
				'description': 'IfStatement + ReturnStatement',
				'original': 'if 1 then return end',
				'minified': 'if 1 then return end'
			},
			{
				'description': 'IfStatement + IfStatement',
				'original': 'if 1 then end; if 1 then end;',
				'minified': 'if 1 then end;if 1 then end'
			}
		],

		// DoStatement
		'DoStatement': [
			{
				'description': 'DoStatement + LocalStatement',
				'original': 'do local foo local bar end',
				'minified': 'do local a;local b end'
			},
			{
				'description': 'DoStatement + LocalStatement',
				'original': 'do local foo; local bar; end',
				'minified': 'do local a;local b end'
			},
			{
				'description': 'DoStatement + LocalStatement',
				'original': 'do local foo = 1 end',
				'minified': 'do local a=1 end'
			},
			{
				'description': 'DoStatement + DoStatement',
				'original': 'do do end end',
				'minified': 'do do end end'
			},
			{
				'description': 'DoStatement + DoStatement',
				'original': 'do do end; end',
				'minified': 'do do end end'
			},
			{
				'description': 'DoStatement + DoStatement + DoStatement',
				'original': 'do do do end end end',
				'minified': 'do do do end end end'
			},
			{
				'description': 'DoStatement + DoStatement + DoStatement',
				'original': 'do do do end; end; end',
				'minified': 'do do do end end end'
			},
			{
				'description': 'DoStatement + DoStatement + DoStatement + ReturnStatement',
				'original': 'do do do return end end end',
				'minified': 'do do do return end end end'
			}
		],

		// Expressions
		'Expressions': [
			{
				'description': 'AssignmentStatement',
				'original': 'a = {}',
				'minified': 'a={}'
			},
			{
				'description': 'AssignmentStatement',
				'original': 'a = (a)',
				'minified': 'a=a'
			},
			{
				'description': 'AssignmentStatement',
				'original': 'a = (nil)',
				'minified': 'a=nil'
			},
			{
				'description': 'AssignmentStatement',
				'original': 'a = (true)',
				'minified': 'a=true'
			},
			{
				'description': 'AssignmentStatement',
				'original': 'a = (1)',
				'minified': 'a=1'
			},
			{
				'description': 'AssignmentStatement',
				'original': 'a = ("foo")',
				'minified': 'a="foo"'
			},
			{
				'description': 'AssignmentStatement',
				'original': 'a = (\'foo\')',
				'minified': 'a=\'foo\''
			},
			{
				'description': 'AssignmentStatement',
				'original': 'a = ([[foo]])',
				'minified': 'a=[[foo]]'
			},
			{
				'description': 'AssignmentStatement + TableConstructorExpression',
				'original': 'a = ({})',
				'minified': 'a={}'
			},
			{
				'description': 'AssignmentStatement + MemberExpression',
				'original': 'a = a.foo',
				'minified': 'a=a.foo'
			},
			{
				'description': 'AssignmentStatement + IndexExpression',
				'original': 'a = a[1]',
				'minified': 'a=a[1]'
			},
			{
				'description': 'AssignmentStatement + IndexExpression',
				'original': 'a = a["foo"]',
				'minified': 'a=a["foo"]'
			},
			{
				'description': 'AssignmentStatement + IndexExpression',
				'original': 'a = a[\'foo\']',
				'minified': 'a=a[\'foo\']'
			},
			{
				'description': 'AssignmentStatement + IndexExpression + IndexExpression',
				'original': 'a = a[b][c]',
				'minified': 'a=a[b][c]'
			},
			{
				'description': 'AssignmentStatement + MemberExpression + IndexExpression',
				'original': 'a = a.foo[c]',
				'minified': 'a=a.foo[c]'
			},
			{
				'description': 'AssignmentStatement + IndexExpression + MemberExpression',
				'original': 'a = a[b].c',
				'minified': 'a=a[b].c'
			},
			{
				'description': 'AssignmentStatement + IndexExpression',
				'original': 'a = (a)[b]',
				'minified': 'a=a[b]'
			},
			{
				'description': 'AssignmentStatement + MemberExpression',
				'original': 'a = (a).foo',
				'minified': 'a=a.foo'
			},
			{
				'description': 'AssignmentStatement + MemberExpression + CallExpression',
				'original': 'a = a.foo()',
				'minified': 'a=a.foo()'
			},
			{
				'description': 'AssignmentStatement + IndexExpression + CallExpression',
				'original': 'a = a[b]()',
				'minified': 'a=a[b]()'
			},
			{
				'description': 'AssignmentStatement + MemberExpression + CallExpression',
				'original': 'a = a:foo()',
				'minified': 'a=a:foo()'
			},
			{
				'description': 'AssignmentStatement + CallExpression',
				'original': 'a = (a)()',
				'minified': 'a=a()'
			},
			{
				'description': 'AssignmentStatement + MemberExpression + CallExpression',
				'original': 'a = (a).b()',
				'minified': 'a=a.b()'
			},
			{
				'description': 'AssignmentStatement + IndexExpression + CallExpression',
				'original': 'a = (a)[b]()',
				'minified': 'a=a[b]()'
			},
			{
				'description': 'CallStatement + IndexExpression + BinaryExpression',
				'original': 'print(("a".."b")[0])',
				'minified': 'print(("a".."b")[0])'
			},
			{
				'description': 'AssignmentStatement + MemberExpression + CallExpression',
				'original': 'a = (a):b()',
				'minified': 'a=a:b()'
			},
			{
				'description': 'AssignmentStatement + StringCallExpression',
				'original': 'a = a"foo"',
				'minified': 'a=a"foo"'
			},
			{
				'description': 'AssignmentStatement + StringCallExpression',
				'original': 'a = a"fo\\\"o"',
				'minified': 'a=a"fo\\\"o"'
			},
			{
				'description': 'AssignmentStatement + StringCallExpression',
				'original': 'a = a\'foo\'',
				'minified': 'a=a\'foo\''
			},
			{
				'description': 'AssignmentStatement + TableCallExpression',
				'original': 'a = a{}',
				'minified': 'a=a{}'
			},
			{
				'description': 'AssignmentStatement + FunctionDeclaration',
				'original': 'a = function() end',
				'minified': 'a=function()end'
			},
			{
				'description': 'AssignmentStatement + FunctionDeclaration',
				'original': 'a = function(p) end',
				'minified': 'a=function(b)end'
			},
			{
				'description': 'AssignmentStatement + FunctionDeclaration',
				'original': 'a = function(p,q,r) end',
				'minified': 'a=function(b,c,d)end'
			},
			{
				'description': 'AssignmentStatement + FunctionDeclaration',
				'original': 'a = function(...) end',
				'minified': 'a=function(...)end'
			},
			{
				'description': 'AssignmentStatement + FunctionDeclaration',
				'original': 'a = function(p, ...) end',
				'minified': 'a=function(b,...)end'
			},
			{
				'description': 'Assignments + FunctionDeclaration',
				'original': 'a = function(p, q, r, ...) end',
				'minified': 'a=function(b,c,d,...)end'
			},
			{
				'description': 'AssignmentStatement + TableConstructorExpression',
				'original': 'a = {\'-\'}',
				'minified': 'a={\'-\'}'
			},
			{
				'description': 'AssignmentStatement + TableConstructorExpression',
				'original': 'a = {\'not\'}',
				'minified': 'a={\'not\'}'
			},
			{
				'description': 'AssignmentStatement + TableConstructorExpression',
				'original': 'a = {not true}',
				'minified': 'a={not true}'
			},
			{
				'description': 'MemberExpression on a TableConstructorExpression',
				'original': 'x = ({}).y',
				'minified': 'x=({}).y'
			},
			{
				'description': 'MemberExpression + CallExpression on a TableConstructorExpression',
				'original': 'x = ({ foo = print }):foo("test")',
				'minified': 'x=({foo=print}):foo("test")'
			},
			{
				'description': 'MemberExpression + CallExpression on a TableConstructorExpression',
				'original': 'x = ({ foo = print }).foo("test")',
				'minified': 'x=({foo=print}).foo("test")'
			},
			{
				'description': 'LogicalExpression in parenthesis + MemberExpression + CallExpression',
				'original': '(x or y):f()',
				'minified': '(x or y):f()'
			},
			{
				'description': 'StringLiteral in parenthesis + MemberExpression + CallExpression',
				'original': '("abc"):f()',
				'minified': '("abc"):f()'
			}
		],

		// ForGenericStatement
		'ForGenericStatement': [
			{
				'description': 'ForGenericStatement',
				'original': 'for a in b do end',
				'minified': 'for a in b do end'
			},
			{
				'description': 'ForGenericStatement + LocalStatement',
				'original': 'for a in b do local a local b end',
				'minified': 'for a in b do local a;local b end'
			},
			{
				'description': 'ForGenericStatement + LocalStatement',
				'original': 'for a in b do local a; local b; end',
				'minified': 'for a in b do local a;local b end'
			},
			{
				'description': 'ForGenericStatement',
				'original': 'for a, b, c in p do end',
				'minified': 'for a,b,c in p do end'
			},
			{
				'description': 'ForGenericStatement',
				'original': 'for a, b, c in p, q, r do end',
				'minified': 'for a,b,c in p,q,r do end'
			},
			{
				'description': 'ForGenericStatement',
				'original': 'for a in 1 do end',
				'minified': 'for a in 1 do end'
			},
			{
				'description': 'ForGenericStatement',
				'original': 'for a in true do end',
				'minified': 'for a in true do end'
			},
			{
				'description': 'ForGenericStatement',
				'original': 'for a in "foo" do end',
				'minified': 'for a in"foo"do end'
			},
			{
				'description': 'ForGenericStatement',
				'original': 'for a in b do break end',
				'minified': 'for a in b do break end'
			},
			{
				'description': 'ForGenericStatement + ReturnStatement',
				'original': 'for a in b do return end',
				'minified': 'for a in b do return end'
			},
			{
				'description': 'ForGenericStatement + DoStatement',
				'original': 'for a in b do do end end',
				'minified': 'for a in b do do end end'
			},
			{
				'description': 'ForGenericStatement + DoStatement + BreakStatement',
				'original': 'for a in b do do break end end',
				'minified': 'for a in b do do break end end'
			},
			{
				'description': 'ForGenericStatement + DoStatement + ReturnStatement',
				'original': 'for a in b do do return end end',
				'minified': 'for a in b do do return end end'
			},
			{
				'description': 'ForNumericStatement',
				'original': 'for a = p, q do end',
				'minified': 'for a=p,q do end'
			},
			{
				'description': 'ForNumericStatement',
				'original': 'for a = 1, 2 do end',
				'minified': 'for a=1,2 do end'
			},
			{
				'description': 'ForNumericStatement + LocalStatement',
				'original': 'for a = 1, 2 do local a local b end',
				'minified': 'for a=1,2 do local a;local b end'
			},
			{
				'description': 'ForNumericStatement + LocalStatement',
				'original': 'for a = 1, 2 do local a; local b; end',
				'minified': 'for a=1,2 do local a;local b end'
			},
			{
				'description': 'ForNumericStatement',
				'original': 'for a = p, q, r do end',
				'minified': 'for a=p,q,r do end'
			},
			{
				'description': 'ForNumericStatement',
				'original': 'for a = 1, 2, 3 do end',
				'minified': 'for a=1,2,3 do end'
			},
			{
				'description': 'ForNumericStatement + BreakStatement',
				'original': 'for a = p, q do break end',
				'minified': 'for a=p,q do break end'
			},
			{
				'description': 'ForNumericStatement + ReturnStatement',
				'original': 'for a = 1, 2 do return end',
				'minified': 'for a=1,2 do return end'
			},
			{
				'description': 'ForNumericStatement + DoStatement',
				'original': 'for a = p, q do do end end',
				'minified': 'for a=p,q do do end end'
			},
			{
				'description': 'ForNumericStatement + DoStatement + BreakStatement',
				'original': 'for a = p, q do do break end end',
				'minified': 'for a=p,q do do break end end'
			},
			{
				'description': 'ForNumericStatement + DoStatement + ReturnStatement',
				'original': 'for a = p, q do do return end end',
				'minified': 'for a=p,q do do return end end'
			}
		],

		// Function calls
		'CallStatement': [
			{
				'description': 'CallStatement',
				'original': 'a()',
				'minified': 'a()'
			},
			{
				'description': 'CallStatement',
				'original': 'a(1)',
				'minified': 'a(1)'
			},
			{
				'description': 'CallStatement',
				'original': 'a(1, 2, 3)',
				'minified': 'a(1,2,3)'
			},
			{
				'description': 'EnclosedCallStatement',
				'original': '(select(1, ...))',
				'minified': '(select(1,...))'
			},
			{
				'description': 'CallStatement + CallExpression',
				'original': 'a()()',
				'minified': 'a()()'
			},
			{
				'description': 'CallStatement + MemberExpression',
				'original': 'a.b()',
				'minified': 'a.b()'
			},
			{
				'description': 'CallStatement + IndexExpression',
				'original': 'a[b]()',
				'minified': 'a[b]()'
			},
			{
				'description': 'CallStatement + MemberExpression',
				'original': 'a.b.c()',
				'minified': 'a.b.c()'
			},
			{
				'description': 'CallStatement + IndexExpression + IndexExpression',
				'original': 'a[b][c]()',
				'minified': 'a[b][c]()'
			},
			{
				'description': 'CallStatement + IndexExpression + MemberExpression',
				'original': 'a[b].c()',
				'minified': 'a[b].c()'
			},
			{
				'description': 'CallStatement + MemberExpression + IndexExpression',
				'original': 'a.b[c]()',
				'minified': 'a.b[c]()'
			},
			{
				'description': 'CallStatement + MemberExpression',
				'original': 'a:b()',
				'minified': 'a:b()'
			},
			{
				'description': 'CallStatement + MemberExpression + MemberExpression',
				'original': 'a.b:c()',
				'minified': 'a.b:c()'
			},
			{
				'description': 'CallStatement + IndexExpression + MemberExpression',
				'original': 'a[b]:c()',
				'minified': 'a[b]:c()'
			},
			{
				'description': 'CallStatement + MemberExpression + MemberExpression',
				'original': 'a:b():c()',
				'minified': 'a:b():c()'
			},
			{
				'description': 'CallStatement + MemberExpression + MemberExpression + IndexExpression + MemberExpression',
				'original': 'a:b().c[d]:e()',
				'minified': 'a:b().c[d]:e()'
			},
			{
				'description': 'CallStatement + MemberExpression + IndexExpression + MemberExpression + MemberExpression + CallExpression',
				'original': 'a:b()[c].d:e()',
				'minified': 'a:b()[c].d:e()'
			},
			{
				'description': 'CallStatement',
				'original': '(a)()',
				'minified': 'a()'
			},
			{
				'description': 'CallStatement',
				'original': '(1)()',
				'minified': '1()'
			},
			{
				'description': 'CallStatement',
				'original': '("foo")()',
				'minified': '("foo")()'
			},
			{
				'description': 'CallStatement',
				'original': '(true)()',
				'minified': 'true()'
			},
			{
				'description': 'CallStatement + CallExpression',
				'original': '(a)()()',
				'minified': 'a()()'
			},
			{
				'description': 'CallStatement + MemberExpression',
				'original': '(a.b)()',
				'minified': 'a.b()'
			},
			{
				'description': 'CallStatement + IndexExpression',
				'original': '(a[b])()',
				'minified': 'a[b]()'
			},
			{
				'description': 'CallStatement + MemberExpression',
				'original': '(a).b()',
				'minified': 'a.b()'
			},
			{
				'description': 'CallStatement + IndexExpression',
				'original': '(a)[b]()',
				'minified': 'a[b]()'
			},
			{
				'description': 'CallStatement + MemberExpression',
				'original': '(a):b()',
				'minified': 'a:b()'
			},
			{
				'description': 'CallStatement + MemberExpression + IndexExpression + MemberExpression + CallExpression',
				'original': '(a).b[c]:d()',
				'minified': 'a.b[c]:d()'
			},
			{
				'description': 'CallStatement + IndexExpression + MemberExpression + MemberExpression',
				'original': '(a)[b].c:d()',
				'minified': 'a[b].c:d()'
			},
			{
				'description': 'CallStatement + MemberExpression + CallExpression + MemberExpression',
				'original': '(a):b():c()',
				'minified': 'a:b():c()'
			},
			{
				'description': 'CallStatement + MemberExpression + CallExpression + MemberExpression + MemberExpression',
				'original': '(a):b().c[d]:e()',
				'minified': 'a:b().c[d]:e()'
			},
			{
				'description': 'CallStatement + MemberExpression + CallExpression + IndexExpression + MemberExpression + MemberExpression',
				'original': '(a):b()[c].d:e()',
				'minified': 'a:b()[c].d:e()'
			},
			{
				'description': 'CallStatement + StringCallExpression',
				'original': 'a"foo"',
				'minified': 'a"foo"'
			},
			{
				'description': 'CallStatement + StringCallExpression',
				'original': 'a[[foo]]',
				'minified': 'a[[foo]]'
			},
			{
				'description': 'CallStatement + MemberExpression + StringCallExpression',
				'original': 'a.b"foo"',
				'minified': 'a.b"foo"'
			},
			{
				'description': 'CallStatement + IndexExpression + StringCallExpression',
				'original': 'a[b]"foo"',
				'minified': 'a[b]"foo"'
			},
			{
				'description': 'CallStatement + MemberExpression + StringCallExpression',
				'original': 'a:b"foo"',
				'minified': 'a:b"foo"'
			},
			{
				'description': 'CallStatement + TableCallExpression',
				'original': 'a{}',
				'minified': 'a{}'
			},
			{
				'description': 'CallStatement + MemberExpression + TableCallExpression',
				'original': 'a.b{}',
				'minified': 'a.b{}'
			},
			{
				'description': 'CallStatement + IndexExpression + TableCallExpression',
				'original': 'a[b]{}',
				'minified': 'a[b]{}'
			},
			{
				'description': 'CallStatement + MemberExpression + TableCallExpression',
				'original': 'a:b{}',
				'minified': 'a:b{}'
			},
			{
				'description': 'CallStatement + StringCallExpression',
				'original': 'a()"foo"',
				'minified': 'a()"foo"'
			},
			{
				'description': 'CallStatement + StringCallExpression',
				'original': 'a"foo"()',
				'minified': 'a"foo"()'
			},
			{
				'description': 'CallStatement + StringCallExpression + MemberExpression',
				'original': 'a"foo".b()',
				'minified': 'a"foo".b()'
			},
			{
				'description': 'CallStatement + StringCallExpression + IndexExpression',
				'original': 'a"foo"[b]()',
				'minified': 'a"foo"[b]()'
			},
			{
				'description': 'CallStatement + StringCallExpression + MemberExpression',
				'original': 'a"foo":c()',
				'minified': 'a"foo":c()'
			},
			{
				'description': 'CallStatement + StringCallExpression + StringCallExpression',
				'original': 'a"foo""bar"',
				'minified': 'a"foo""bar"'
			},
			{
				'description': 'CallStatement + StringCallExpression + TableCallExpression',
				'original': 'a"foo"{}',
				'minified': 'a"foo"{}'
			},
			{
				'description': 'CallStatement + MemberExpression + StringCallExpression + MemberExpression + IndexExpression + MemberExpression + StringCallExpression',
				'original': '(a):b"foo".c[d]:e"bar"',
				'minified': 'a:b"foo".c[d]:e"bar"'
			},
			{
				'description': 'CallStatement + MemberExpression + StringCallExpression + IndexExpression + MemberExpression + MemberExpression + StringCallExpression',
				'original': '(a):b"foo"[c].d:e"bar"',
				'minified': 'a:b"foo"[c].d:e"bar"'
			},
			{
				'description': 'CallStatement + TableConstructorExpression',
				'original': 'a(){}',
				'minified': 'a(){}'
			},
			{
				'description': 'CallStatement + TableConstructorExpression',
				'original': 'a{}()',
				'minified': 'a{}()'
			},
			{
				'description': 'CallStatement + TableConstructorExpression + MemberExpression',
				'original': 'a{}.b()',
				'minified': 'a{}.b()'
			},
			{
				'description': 'CallStatement + TableConstructorExpression + IndexExpression',
				'original': 'a{}[b]()',
				'minified': 'a{}[b]()'
			},
			{
				'description': 'CallStatement + TableConstructorExpression + MemberExpression',
				'original': 'a{}:c()',
				'minified': 'a{}:c()'
			},
			{
				'description': 'CallStatement + TableConstructorExpression + StringCallExpression',
				'original': 'a{}"foo"',
				'minified': 'a{}"foo"'
			},
			{
				'description': 'CallStatement + TableConstructorExpression + TableConstructorExpression',
				'original': 'a{}{}',
				'minified': 'a{}{}'
			},
			{
				'description': 'CallStatement + MemberExpression + TableConstructorExpression + MemberExpression + MemberExpression + MemberExpression + TableConstructorExpression',
				'original': '(a):b{}.c[d]:e{}',
				'minified': 'a:b{}.c[d]:e{}'
			},
			{
				'description': 'CallStatement + MemberExpression + TableConstructorExpression + IndexExpression + MemberExpression + MemberExpression + TableConstructorExpression',
				'original': '(a):b{}[c].d:e{}',
				'minified': 'a:b{}[c].d:e{}'
			}
		],

		// FunctionDeclaration
		'FunctionDeclaration': [
			{
				'description': 'FunctionDeclaration',
				'original': 'function a() end',
				'minified': 'function a()end'
			},
			{
				'description': 'FunctionDeclaration',
				'original': 'function a(p) end',
				'minified': 'function a(b)end'
			},
			{
				'description': 'FunctionDeclaration',
				'original': 'function a(p, q, r) end',
				'minified': 'function a(b,c,d)end'
			},
			{
				'description': 'FunctionDeclaration + ReturnStatement',
				'original': 'function a(p) return end',
				'minified': 'function a(b)return end'
			},
			{
				'description': 'FunctionDeclaration + DoStatement',
				'original': 'function a(p) do end end',
				'minified': 'function a(b)do end end'
			},
			{
				'description': 'FunctionDeclaration + MemberExpression',
				'original': 'function a.b() end',
				'minified': 'function a.b()end'
			},
			{
				'description': 'FunctionDeclaration + MemberExpression',
				'original': 'function a.b.c.d() end',
				'minified': 'function a.b.c.d()end'
			},
			{
				'description': 'FunctionDeclaration + MemberExpression',
				'original': 'function a:b() end',
				'minified': 'function a:b()end'
			},
			{
				'description': 'FunctionDeclaration + MemberExpression',
				'original': 'function a.b.c:d() end',
				'minified': 'function a.b.c:d()end'
			},
			{
				'description': 'FunctionDeclaration',
				'original': 'function a(...) end',
				'minified': 'function a(...)end'
			},
			{
				'description': 'FunctionDeclaration',
				'original': 'function a(p, ...) end',
				'minified': 'function a(b,...)end'
			},
			{
				'description': 'FunctionDeclaration',
				'original': 'function a(p, q, r, ...) end',
				'minified': 'function a(b,c,d,...)end'
			},
			{
				'description': 'FunctionDeclaration + LocalStatement',
				'original': 'function a() local a local b end',
				'minified': 'function a()local a;local b end'
			},
			{
				'description': 'FunctionDeclaration + LocalStatement',
				'original': 'function a() local a; local b; end',
				'minified': 'function a()local a;local b end'
			},
			{
				'description': 'FunctionDeclaration + FunctionDeclaration',
				'original': 'function a() end; function a() end;',
				'minified': 'function a()end;function a()end'
			},
			{
				'description': 'FunctionDeclaration + WhileStatement',
				'original': 'a = function() while true do end end',
				'minified': 'a=function()while true do end end'
			},
			{
				'description': 'CallExpression + FunctionDeclaration lambda',
				'original': '(function() end)()',
				'minified': '(function()end)()'
			}
		],

		// Literals
		'Literals': [
			{
				'description': 'NumericLiteral',
				'original': 'a = 1',
				'minified': 'a=1'
			},
			{
				'description': 'NumericLiteral',
				'original': 'a = .1',
				'minified': 'a=.1'
			},
			{
				'description': 'NumericLiteral',
				'original': 'a = 1.',
				'minified': 'a=1.'
			},
			{
				'description': 'NumericLiteral + Any Statement',
				'original': 'a = 1.;b=2',
				'minified': 'a=1.;b=2'
			},
			{
				'description': 'NumericLiteral',
				'original': 'a = 1.1',
				'minified': 'a=1.1'
			},
			{
				'description': 'NumericLiteral',
				'original': 'a = 10.1',
				'minified': 'a=10.1'
			},
			{
				'description': 'NumericLiteral',
				'original': 'a = 1e1',
				'minified': 'a=1e1'
			},
			{
				'description': 'NumericLiteral',
				'original': 'a = 1E1',
				'minified': 'a=1E1'
			},
			{
				'description': 'NumericLiteral',
				'original': 'a = 1e+9',
				'minified': 'a=1e+9'
			},
			{
				'description': 'NumericLiteral',
				'original': 'a = 1e-1',
				'minified': 'a=1e-1'
			},
			{
				'description': 'NumericLiteral',
				'original': 'a = 0xf',
				'minified': 'a=0xf'
			},
			{
				'description': 'NumericLiteral',
				'original': 'a = 0xf.',
				'minified': 'a=0xf.'
			},
			{
				'description': 'NumericLiteral',
				'original': 'a = 0xf.3',
				'minified': 'a=0xf.3'
			},
			{
				'description': 'NumericLiteral',
				'original': 'a = 0xfp1',
				'minified': 'a=0xfp1'
			},
			{
				'description': 'NumericLiteral',
				'original': 'a = 0xfp+1',
				'minified': 'a=0xfp+1'
			},
			{
				'description': 'NumericLiteral',
				'original': 'a = 0xfp-1',
				'minified': 'a=0xfp-1'
			},
			{
				'description': 'NumericLiteral',
				'original': 'a = 0xFP+9',
				'minified': 'a=0xFP+9'
			},
			{
				'description': 'NumericLiteral',
				'original': 'a = 1 .. 3 .. -2',
				'minified': 'a=1 ..3 ..-2'
			},
			{
				'description': 'NumericLiteral + StringLiteral',
				'original': 'a = 1 .. "bar"',
				'minified': 'a=1 .."bar"'
			},
			{
				'description': 'StringLiteral',
				'original': 'a = \'bar\'',
				'minified': 'a=\'bar\''
			},
			{
				'description': 'StringLiteral',
				'original': 'a = "bar"',
				'minified': 'a="bar"'
			},
			{
				'description': 'StringLiteral',
				'original': 'a = [[bar]]',
				'minified': 'a=[[bar]]'
			},
			{
				'description': 'NilLiteral',
				'original': 'a = nil',
				'minified': 'a=nil'
			},
			{
				'description': 'BooleanLiteral',
				'original': 'a = true',
				'minified': 'a=true'
			},
			{
				'description': 'BooleanLiteral',
				'original': 'a = false',
				'minified': 'a=false'
			},
			{
				'description': 'VarargLiteral',
				'original': 'a = ...',
				'minified': 'a=...'
			}
		],

		// Escape sequences
		'Escape sequences': [
			{
				'description': 'String escape sequence',
				'original': 'a = "bar\\tbaz"',
				'minified': 'a="bar\\tbaz"'
			},
			{
				'description': 'String escape sequence',
				'original': 'a = "bar\\\\tbaz"',
				'minified': 'a="bar\\\\tbaz"'
			},
			{
				'description': 'String escape sequence',
				'original': 'a = "bar\\\\nbaz"',
				'minified': 'a="bar\\\\nbaz"'
			},
			{
				'description': 'String escape sequence',
				'original': 'a = "bar\\\\rbaz"',
				'minified': 'a="bar\\\\rbaz"'
			},
			{
				'description': 'String escape sequence',
				'original': 'a = "bar\\80baz"',
				'minified': 'a="bar\\80baz"'
			},
			{
				'description': 'String escape sequence',
				'original': 'a = "bar\\800\\0baz"',
				'minified': 'a="bar\\800\\0baz"'
			},
			{
				'description': 'String escape sequence',
				'original': 'a = "bar\\\\z   baz"',
				'minified': 'a="bar\\\\z   baz"'
			},
			{
				'description': 'String escape sequence',
				'original': 'a = "bar\\\\f\\\\v\\bbaz"',
				'minified': 'a="bar\\\\f\\\\v\\bbaz"'
			},
			{
				'description': 'String escape sequence',
				'original': 'a = "bar\\f\\v\\bbaz"',
				'minified': 'a="bar\\f\\v\\bbaz"'
			},
			{
				'description': 'String escape sequence',
				'original': 'a = [[bar\\f\\v\\bbaz]]',
				'minified': 'a=[[bar\\f\\v\\bbaz]]'
			},
			{
				'description': 'String escape sequence',
				'original': "c = '\\\\'",
				'minified': "c='\\\\'"
			},
			{
				'description': 'String escape sequence',
				'original': "c = '\\\''",
				'minified': "c='\\\''"
			},
			{
				'description': 'String escape sequence',
				'original': "c = '\\123",
				'minified': "c='\\123"
			},
			{
				'description': 'String escape sequence',
				'original': "c = '\\x23",
				'minified': "c='\\x23"
			},
			{
				'description': 'String escape sequence',
				'original': "c = '\\xx'",
				'minified': "c='\\xx'"
			}
		],

		// LocalStatement
		'LocalStatement': [
			{
				'description': 'LocalStatement',
				'original': 'local a',
				'minified': 'local a'
			},
			{
				'description': 'LocalStatement',
				'original': 'local a;',
				'minified': 'local a'
			},
			{
				'description': 'LocalStatement',
				'original': 'local a, b, c',
				'minified': 'local a,b,c'
			},
			{
				'description': 'LocalStatement',
				'original': 'local a; local b local c;',
				'minified': 'local a;local b;local c'
			},
			{
				'description': 'LocalStatement',
				'original': 'local a = 1',
				'minified': 'local a=1'
			},
			{
				'description': 'LocalStatement',
				'original': 'local a local b = a',
				'minified': 'local a;local b=a'
			},
			{
				'description': 'LocalStatement',
				'original': 'local a, b = 1, 2',
				'minified': 'local a,b=1,2'
			},
			{
				'description': 'LocalStatement',
				'original': 'local a, b, c = 1, 2, 3',
				'minified': 'local a,b,c=1,2,3'
			},
			{
				'description': 'LocalStatement',
				'original': 'local a, b, c = 1',
				'minified': 'local a,b,c=1'
			},
			{
				'description': 'LocalStatement',
				'original': 'local a = 1, 2, 3',
				'minified': 'local a=1,2,3'
			},
			{
				'description': 'LocalStatement',
				'original': 'local function a() end',
				'minified': 'local function a()end'
			},
			{
				'description': 'LocalStatement',
				'original': 'local function a(p) end',
				'minified': 'local function a(b)end'
			},
			{
				'description': 'LocalStatement',
				'original': 'local function a(p,q,r) end',
				'minified': 'local function a(b,c,d)end'
			},
			{
				'description': 'LocalStatement',
				'original': 'local function a(p) return end',
				'minified': 'local function a(b)return end'
			},
			{
				'description': 'LocalStatement',
				'original': 'local function a(p) do end end',
				'minified': 'local function a(b)do end end'
			},
			{
				'description': 'LocalStatement',
				'original': 'local function a(...) end',
				'minified': 'local function a(...)end'
			},
			{
				'description': 'LocalStatement',
				'original': 'local function a(p,...) end',
				'minified': 'local function a(b,...)end'
			},
			{
				'description': 'LocalStatement',
				'original': 'local function a(p,q,r,...) end',
				'minified': 'local function a(b,c,d,...)end'
			},
			{
				'description': 'LocalStatement',
				'original': 'local function a() local a local b end',
				'minified': 'local function a()local a;local b end'
			},
			{
				'description': 'LocalStatement',
				'original': 'local function a() local a; local b; end',
				'minified': 'local function a()local a;local b end'
			},
			{
				'description': 'LocalStatement',
				'original': 'local function a() end; local function a() end;',
				'minified': 'local function a()end;local function a()end'
			}
		],

		// Operators
		'Operators': [
			{
				'description': 'Operators',
				'original': 'a = -10',
				'minified': 'a=-10'
			},
			{
				'description': 'Operators',
				'original': 'a = -"foo"',
				'minified': 'a=-"foo"'
			},
			{
				'description': 'Operators',
				'original': 'a = -a',
				'minified': 'a=-a'
			},
			{
				'description': 'Operators',
				'original': 'a = -nil',
				'minified': 'a=-nil'
			},
			{
				'description': 'Operators',
				'original': 'a = -true',
				'minified': 'a=-true'
			},
			{
				'description': 'Operators',
				'original': 'a = -{}',
				'minified': 'a=-{}'
			},
			{
				'description': 'Operators',
				'original': 'a = -function() end',
				'minified': 'a=-function()end'
			},
			{
				'description': 'Operators',
				'original': 'a = -a()',
				'minified': 'a=-a()'
			},
			{
				'description': 'Operators',
				'original': 'a = -(a)',
				'minified': 'a=-a'
			},
			{
				'description': 'Operators',
				'original': 'a = not 10',
				'minified': 'a=not 10'
			},
			{
				'description': 'Operators',
				'original': 'a = not "foo"',
				'minified': 'a=not"foo"'
			},
			{
				'description': 'Operators',
				'original': 'a = not a',
				'minified': 'a=not a'
			},
			{
				'description': 'Operators',
				'original': 'a = not nil',
				'minified': 'a=not nil'
			},
			{
				'description': 'Operators',
				'original': 'a = not true',
				'minified': 'a=not true'
			},
			{
				'description': 'Operators',
				'original': 'a = not {}',
				'minified': 'a=not{}'
			},
			{
				'description': 'Operators',
				'original': 'a = not function() end',
				'minified': 'a=not function()end'
			},
			{
				'description': 'Operators',
				'original': 'a = not a()',
				'minified': 'a=not a()'
			},
			{
				'description': 'Operators',
				'original': 'a = not (a)',
				'minified': 'a=not a'
			},
			{
				'description': 'Operators',
				'original': 'a = 1 + 2; a = 1 - 2',
				'minified': 'a=1+2;a=1-2'
			},
			{
				'description': 'Operators',
				'original': 'a = 1 * 2; a = 1 / 2',
				'minified': 'a=1*2;a=1/2'
			},
			{
				'description': 'Operators',
				'original': 'a = 1 ^ 2; a = 1 .. 2',
				'minified': 'a=1^2;a=1 ..2'
			},
			{
				'description': 'Operators',
				'original': 'a = 1 + -2; a = 1 - -2',
				'minified': 'a=1+-2;a=1- -2'
			},
			{
				'description': 'Operators',
				'original': 'a = 1 * not 2; a = 1 / not 2',
				'minified': 'a=1*not 2;a=1/not 2'
			},
			{
				'description': 'Operators',
				'original': 'a = 1 + 2 - 3 * 4 / 5 ^ 6',
				'minified': 'a=1+2-3*4/5^6'
			},
			{
				'description': 'Operators',
				'original': 'a = a + b - c',
				'minified': 'a=a+b-c'
			},
			{
				'description': 'Operators',
				'original': 'a = "foo" + "bar"',
				'minified': 'a="foo"+"bar"'
			},
			{
				'description': 'Operators',
				'original': 'a = "foo".."bar".."baz"',
				'minified': 'a="foo".."bar".."baz"'
			},
			{
				'description': 'Operators',
				'original': 'a = ("foo".."bar".."baz")',
				'minified': 'a="foo".."bar".."baz"'
			},
			{
				'description': 'Operators',
				'original': 'a = (("foo".."bar".."baz"))',
				'minified': 'a="foo".."bar".."baz"'
			},
			{
				'description': 'Operators',
				'original': 'a = true + false - nil',
				'minified': 'a=true+false-nil'
			},
			{
				'description': 'Operators',
				'original': 'a = {} * {}',
				'minified': 'a={}*{}'
			},
			{
				'description': 'Operators',
				'original': 'a = function() end / function() end',
				'minified': 'a=function()end/function()end'
			},
			{
				'description': 'Operators',
				'original': 'a = a() ^ b()',
				'minified': 'a=a()^b()'
			},
			{
				'description': 'Operators',
				'original': 'a = 1 == 2; a = 1 ~= 2',
				'minified': 'a=1==2;a=1~=2'
			},
			{
				'description': 'Operators',
				'original': 'a = 1 < 2; a = 1 <= 2',
				'minified': 'a=1<2;a=1<=2'
			},
			{
				'description': 'Operators',
				'original': 'a = 1 > 2; a = 1 >= 2',
				'minified': 'a=1>2;a=1>=2'
			},
			{
				'description': 'Operators',
				'original': 'a = 1 < 2 < 3',
				'minified': 'a=1<2<3'
			},
			{
				'description': 'Operators',
				'original': 'a = 1 >= 2 >= 3',
				'minified': 'a=1>=2>=3'
			},
			{
				'description': 'Operators',
				'original': 'a = "foo" == "bar"',
				'minified': 'a="foo"=="bar"'
			},
			{
				'description': 'Operators',
				'original': 'a = "foo" > "bar"',
				'minified': 'a="foo">"bar"'
			},
			{
				'description': 'Operators',
				'original': 'a = a ~= b',
				'minified': 'a=a~=b'
			},
			{
				'description': 'Operators',
				'original': 'a = true == false',
				'minified': 'a=true==false'
			},
			{
				'description': 'Operators',
				'original': 'a = 1 and 2; a = 1 or 2',
				'minified': 'a=1 and 2;a=1 or 2'
			},
			{
				'description': 'Operators',
				'original': 'a = 1 and 2 and 3',
				'minified': 'a=1 and 2 and 3'
			},
			{
				'description': 'Operators',
				'original': 'a = 1 or 2 or 3',
				'minified': 'a=1 or 2 or 3'
			},
			{
				'description': 'Operators',
				'original': 'a = 1 and 2 or 3',
				'minified': 'a=1 and 2 or 3'
			},
			{
				'description': 'Operators',
				'original': 'a = a and b or c',
				'minified': 'a=a and b or c'
			},
			{
				'description': 'Operators',
				'original': 'a = a() and (b)() or c.d',
				'minified': 'a=a()and b()or c.d'
			},
			{
				'description': 'Operators',
				'original': 'a = "foo" and "bar"',
				'minified': 'a="foo"and"bar"'
			},
			{
				'description': 'Operators',
				'original': 'a = true or false',
				'minified': 'a=true or false'
			},
			{
				'description': 'Operators',
				'original': 'a = {} and {} or {}',
				'minified': 'a={}and{}or{}'
			},
			{
				'description': 'Operators',
				'original': 'a = (1) and ("foo") or (nil)',
				'minified': 'a=1 and"foo"or nil'
			},
			{
				'description': 'Operators',
				'original': 'a = function() end == function() end',
				'minified': 'a=function()end==function()end'
			},
			{
				'description': 'Operators',
				'original': 'a = function() end or function() end',
				'minified': 'a=function()end or function()end'
			},
			{
				'description': 'Operators',
				'original': 'a = true or false and nil',
				'minified': 'a=true or false and nil'
			},
			{
				'description': 'Operators',
				'original': 'a = 2^-2 == 1/4 and -2^- -2 == - - -4',
				'minified': 'a=2^-2==1/4 and-2^- -2==- - -4'
			},
			{
				'description': 'Operators',
				'original': 'a = -3-1-5 == 0+0-9',
				'minified': 'a=-3-1-5==0+0-9'
			}
		],

		// Operator precedence
		'Operator precedence': [
		// http://www.lua.org/manual/5.1/manual.html#2.5.6
			{
				'description': 'Operator precedence',
				'original': 'a = (1 + 2) * 3',
				'minified': 'a=(1+2)*3'
			},
			{
				'description': 'Operator precedence',
				'original': 'a = ((1 + 2) - 3) * (4 / (5 ^ 6))',
				'minified': 'a=(1+2-3)*4/5^6'
			},
			{
				'description': 'Operator precedence',
				'original': 'a = (1 + (2 - (3 * (4 / (5 ^ ((6)))))))',
				'minified': 'a=1+2-3*4/5^6'
			},
			{
				'description': 'Operator precedence',
				'original': 'a = (((1 or false) and true) or false) == true',
				'minified': 'a=((1 or false)and true or false)==true'
			},
			{
				'description': 'Operator precedence',
				'original': 'a = (((nil and true) or false) and true) == false',
				'minified': 'a=((nil and true or false)and true)==false'
			},
			{
				'description': 'Operator precedence',
				'original': 'a = not ((true or false) and nil)',
				'minified': 'a=not((true or false)and nil)'
			},
			{
				'description': 'Operator precedence',
				'original': 'a = -2^2 == -4 and (-2)^2 == 4 and 2*2-3-1 == 0',
				'minified': 'a=-2^2==-4 and(-2)^2==4 and 2*2-3-1==0'
			},
			{
				'description': 'Operator precedence',
				'original': 'a = 2*1+3/3 == 3 and 1+2 .. 3*1 == "33"',
				'minified': 'a=2*1+3/3==3 and 1+2 ..3*1=="33"'
			},
			{
				'description': 'Operator precedence',
				'original': 'a = not nil and 2 and not(2 > 3 or 3 < 2)',
				'minified': 'a=not nil and 2 and not(2>3 or 3<2)'
			},
			{
				'description': 'Operator precedence',
				'original': 'a = not(2+1 > 3*1) and "a".."b" > "a"',
				'minified': 'a=not(2+1>3*1)and"a".."b">"a"'
			},
			{
				'description': 'Operator precedence',
				'original': 'a = 2 ^ (3 ^ 2)',
				'minified': 'a=2^3^2'
			},
			{
				'description': 'Operator precedence',
				'original': 'a = (2 ^ 3) * 4',
				'minified': 'a=2^3*4'
			},
			{
				'description': 'Operator precedence',
				'original': 'a = 2 ^ (2 ^ 3)',
				'minified': 'a=2^2^3'
			},
			{
				'description': 'Operator precedence',
				'original': 'a = 2 ^ (2 ^ (3 ^ 4))',
				'minified': 'a=2^2^3^4'
			},
			{
				'description': 'Operator precedence',
				'original': 'a = 2 ^ (2 ^ (3 ^ 4)) + 1',
				'minified': 'a=2^2^3^4+1'
			},
			{
				'description': 'Operator precedence',
				'original': 'a = (1 * 2) / 3',
				'minified': 'a=1*2/3'
			},
			{
				'description': 'Operator precedence',
				'original': 'a = ( 1 + ( 1 * 2 ) ) > 3',
				'minified': 'a=1+1*2>3'
			},
			{
				'description': 'Operator precedence',
				'original': 'a = (1 < 2) and (2 < 1)',
				'minified': 'a=1<2 and 2<1'
			},
			{
				'description': 'Operator precedence',
				'original': 'a = ((1 / 2) + (4 * 2)) > 8',
				'minified': 'a=1/2+4*2>8'
			},
			{
				'description': 'Operator precedence',
				'original': 'a = (2 < 1) == true',
				'minified': 'a=2<1==true'
			},
			{
				'description': 'Operator precedence',
				'original': 'a = (2 < (1 + 1)) == true',
				'minified': 'a=2<1+1==true'
			},
			{
				'description': 'Operator precedence',
				'original': 'a = (not 1) + 1',
				'minified': 'a=not 1+1'
			},
			{
				'description': 'Operator precedence',
				'original': 'a = (not (not (1)) + 1)',
				'minified': 'a=not not 1+1'
			},
			{
				'description': 'Operator precedence',
				'original': 'a = 1 + (#1)',
				'minified': 'a=1+#1'
			},
			{
				'description': 'Operator precedence',
				'original': 'a = - (x ^ 2)',
				'minified': 'a=-x^2'
			},
			{
				'description': 'Operator precedence',
				'original': 'a = (4 ^ (2 ^ 3))',
				'minified': 'a=4^2^3'
			},
			{
				'description': 'Operator precedence',
				'original': 'a = (1 | 2) & 0',
				'minified': 'a=(1|2)&0'
			},
			{
				'description': 'Operator precedence',
				'original': 'a = 1 | (2 & 0)',
				'minified': 'a=1|2&0'
			},
			{
				'description': 'Operator precedence',
				'original': 'a = (1 | 0) < 1',
				'minified': 'a=1|0<1'
			},
			{
				'description': 'Operator precedence',
				'original': 'a = (0 & 1) + 1',
				'minified': 'a=(0&1)+1'
			},
			{
				'description': 'Operator precedence',
				'original': 'a = 0 & (1 + 1)',
				'minified': 'a=0&1+1'
			},
			{
				'description': 'Operator precedence: right associativity',
				'original': 'a = (((4) ^ 2) ^ 3)',
				'minified': 'a=(4^2)^3'
			},
			{
				'description': 'Operator precedence: left associativity',
				'original': 'a = 1 - (2 - 3)',
				'minified': 'a=1-(2-3)'
			},
			{
				'description': 'Operator precedence: left associativity with special de-parenthesizing',
				'original': 'a = 1 + (2 - 3)',
				'minified': 'a=1+2-3'
			},
			{
				'description': 'Operator precedence: left associativity with special de-parenthesizing',
				'original': 'a = 1 + (2 + 3)',
				'minified': 'a=1+2+3'
			},
			{
				'description': 'Operator precedence: left associativity with special de-parenthesizing',
				'original': 'a = 1 * (2 / 3)',
				'minified': 'a=1*2/3'
			},
			{
				'description': 'Operator precedence: left associativity with special de-parenthesizing',
				'original': 'a = 1 * (2 * 3)',
				'minified': 'a=1*2*3'
			},
			{
				'description': 'Operator precedence',
				'original': 'a = ("a" .. ("b" .. "c"))',
				'minified': 'a="a".."b".."c"'
			},
			{
				'description': 'Operator precedence: right associativity',
				'original': 'a = ((("a") .. "b") .. "c")',
				'minified': 'a=("a".."b").."c"'
			},
			{
				'description': 'Operator precedence: RHS parens',
				'original': 'a = false and (false or true)',
				'minified': 'a=false and(false or true)'
			},
			{
				'description': 'Operator precedence: RHS parens',
				'original': 'a = 1 * (2 - 3)',
				'minified': 'a=1*(2-3)'
			}
		],

		// RepeatStatement
		'RepeatStatement': [
			{
				'description': 'RepeatStatement',
				'original': 'repeat until 0',
				'minified': 'repeat until 0'
			},
			{
				'description': 'RepeatStatement',
				'original': 'repeat until false',
				'minified': 'repeat until false'
			},
			{
				'description': 'RepeatStatement',
				'original': 'repeat local a until 1',
				'minified': 'repeat local a until 1'
			},
			{
				'description': 'RepeatStatement',
				'original': 'repeat local a local b until 0',
				'minified': 'repeat local a;local b until 0'
			},
			{
				'description': 'RepeatStatement',
				'original': 'repeat local a; local b; until 0',
				'minified': 'repeat local a;local b until 0'
			},
			{
				'description': 'RepeatStatement',
				'original': 'repeat return until 0',
				'minified': 'repeat return until 0'
			},
			{
				'description': 'RepeatStatement',
				'original': 'repeat break until 0',
				'minified': 'repeat break until 0'
			},
			{
				'description': 'RepeatStatement',
				'original': 'repeat do end until 0',
				'minified': 'repeat do end until 0'
			},
			{
				'description': 'RepeatStatement',
				'original': 'repeat do return end until 0',
				'minified': 'repeat do return end until 0'
			},
			{
				'description': 'RepeatStatement',
				'original': 'repeat do break end until 0',
				'minified': 'repeat do break end until 0'
			}
		],

		// ReturnStatement
		'ReturnStatement': [
			{
				'description': 'ReturnStatement',
				'original': 'return 1',
				'minified': 'return 1'
			},
			{
				'description': 'ReturnStatement',
				'original': 'return "foo"',
				'minified': 'return"foo"'
			},
			{
				'description': 'ReturnStatement',
				'original': 'return 1, 2, 3',
				'minified': 'return 1,2,3'
			},
			{
				'description': 'ReturnStatement',
				'original': 'return a, b, c, d',
				'minified': 'return a,b,c,d'
			},
			{
				'description': 'ReturnStatement',
				'original': 'return 1, 2;',
				'minified': 'return 1,2'
			}
		],

		// Statements
		'Statements': [
			{
				'description': 'BreakStatement',
				'original': 'break',
				'minified': 'break'
			},
			{
				'description': 'LabelStatement',
				'original': '::foo::',
				'minified': '::a::'
			},
			{
				'description': 'GotoStatement',
				'original': 'goto foo',
				'minified': 'goto a'
			},
			{
				'description': 'LabelStatement + GotoStatement',
				'original': 'for x = 1, 10 do print(x) goto done end ::done::',
				'minified': 'for a=1,10 do print(a)goto b end::b::'
			}
		],

		// TableConstructorExpressions
		'TableConstructorExpressions': [
			{
				'description': 'TableConstructorExpression',
				'original': 'a = {}',
				'minified': 'a={}'
			},
			{
				'description': 'TableConstructorExpression',
				'original': 'a = {{{}}}',
				'minified': 'a={{{}}}'
			},
			{
				'description': 'TableConstructorExpression',
				'original': 'a = {{},{},{{}},}',
				'minified': 'a={{},{},{{}}}'
			},
			{
				'description': 'TableConstructorExpression',
				'original': 'a = { 1 }',
				'minified': 'a={1}'
			},
			{
				'description': 'TableConstructorExpression',
				'original': 'a = { 1, }',
				'minified': 'a={1}'
			},
			{
				'description': 'TableConstructorExpression',
				'original': 'a = { 1; }',
				'minified': 'a={1}'
			},
			{
				'description': 'TableConstructorExpression',
				'original': 'a = { 1, 2 }',
				'minified': 'a={1,2}'
			},
			{
				'description': 'TableConstructorExpression',
				'original': 'a = { a, b, c, }',
				'minified': 'a={a,b,c}'
			},
			{
				'description': 'TableConstructorExpression',
				'original': 'a = { true; false, nil; }',
				'minified': 'a={true,false,nil}'
			},
			{
				'description': 'TableConstructorExpression',
				'original': 'a = { a.b, a[b]; a:c(), }',
				'minified': 'a={a.b,a[b],a:c()}'
			},
			{
				'description': 'TableConstructorExpression',
				'original': 'a = { 1 + 2, a > b, "a" or "b" }',
				'minified': 'a={1+2,a>b,"a"or"b"}'
			},
			{
				'description': 'TableConstructorExpression',
				'original': 'a = { a = 1, }',
				'minified': 'a={a=1}'
			},
			{
				'description': 'TableConstructorExpression',
				'original': 'a = { a = 1, b = "foo", c = nil }',
				'minified': 'a={a=1,b="foo",c=nil}'
			},
			{
				'description': 'TableConstructorExpression',
				'original': 'a = { 1, a = "foo"; b = {}, d = true; }',
				'minified': 'a={1,a="foo",b={},d=true}'
			},
			{
				'description': 'TableConstructorExpression',
				'original': 'a = { ["foo"] = "bar" }',
				'minified': 'a={["foo"]="bar"}'
			},
			{
				'description': 'TableConstructorExpression',
				'original': 'a = { [1] = a, [2] = b, }',
				'minified': 'a={[1]=a,[2]=b}'
			},
			{
				'description': 'TableConstructorExpression',
				'original': 'a = { true, a = 1; ["foo"] = "bar", }',
				'minified': 'a={true,a=1,["foo"]="bar"}'
			},
			{
				'description': 'IndexExpression on a TableConstructorExpression',
				'original': 'x = ({})[1]',
				'minified': 'x=({})[1]'
			}
		],

		// WhileStatement
		'WhileStatement': [
			{
				'description': 'WhileStatement',
				'original': 'while 1 do end',
				'minified': 'while 1 do end'
			},
			{
				'description': 'WhileStatement',
				'original': 'while 1 do local a end',
				'minified': 'while 1 do local a end'
			},
			{
				'description': 'WhileStatement',
				'original': 'while 1 do local a local b end',
				'minified': 'while 1 do local a;local b end'
			},
			{
				'description': 'WhileStatement',
				'original': 'while 1 do local a; local b; end',
				'minified': 'while 1 do local a;local b end'
			},
			{
				'description': 'WhileStatement',
				'original': 'while true do end',
				'minified': 'while true do end'
			},
			{
				'description': 'WhileStatement',
				'original': 'while 1 do return end',
				'minified': 'while 1 do return end'
			},
			{
				'description': 'WhileStatement',
				'original': 'while 1 do do end end',
				'minified': 'while 1 do do end end'
			},
			{
				'description': 'WhileStatement',
				'original': 'while 1 do do return end end',
				'minified': 'while 1 do do return end end'
			},
			{
				'description': 'WhileStatement',
				'original': 'while 1 do break end',
				'minified': 'while 1 do break end'
			},
			{
				'description': 'WhileStatement',
				'original': 'while 1 do do break end end',
				'minified': 'while 1 do do break end end'
			}
		],

		// Rename local variables
		'Variable name shortening': [
			{
				'description': 'Variable shortening should not generate reserved keywords',
				'original': 'a, a0 = 1; local b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, r, s, t, u, v, w, x, y, z, A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X, Y, Z, _, a1, a2, a3, a4, a5, a6, a7, a8, a9, aa, ab, ac, ad, ae, af, ag, ah, ai, aj, ak, al, am, an, ao, ap, aq, ar, as, at, au, av, aw, ax, ay, az, aA, aB, aC, aD, aE, aF, aG, aH, aI, aJ, aK, aL, aM, aN, aO, aP, aQ, aR, aS, aT, aU, aV, aW, aX, aY, aZ, a_, b0, b1, b2, b3, b4, b5, b6, b7, b8, b9, ba, bb, bc, bd, be, bf, bg, bh, bi, bj, bk, bl, bm, bn, bo, bp, bq, br, bs, bt, bu, bv, bw, bx, by, bz, bA, bB, bC, bD, bE, bF, bG, bH, bI, bJ, bK, bL, bM, bN, bO, bP, bQ, bR, bS, bT, bU, bV, bW, bX, bY, bZ, b_, c0, c1, c2, c3, c4, c5, c6, c7, c8, c9, ca, cb, cc, cd, ce, cf, cg, ch, ci, cj, ck, cl, cm, cn, co, cp, cq, cr, cs, ct, cu, cv, cw, cx, cy, cz, cA, cB, cC, cD, cE, cF, cG, cH, cI, cJ, cK, cL, cM, cN, cO, cP, cQ, cR, cS, cT, cU, cV, cW, cX, cY, cZ, c_, d0, d1, d2, d3, d4, d5, d6, d7, d8, d9, da, db, dc, dd, de, df, dg, dh, di, dj, dk, dl, dm, dn, dp, dq, dr, ds, dt, du, dv, dw, dx, dy, dz, dA, dB, dC, dD, dE, dF, dG, dH, dI, dJ, dK, dL, dM, dN, dO, dP, dQ, dR, dS, dT, dU, dV, dW, dX, dY, dZ, d_, e0, e1, e2, e3, e4, e5, e6, e7, e8, e9, ea, eb, ec, ed, ee, ef, eg, eh, ei, ej, ek, el, em, en, eo, ep, eq, er, es, et, eu, ev, ew, ex, ey, ez, eA, eB, eC, eD, eE, eF, eG, eH, eI, eJ, eK, eL, eM, eN, eO, eP, eQ, eR, eS, eT, eU, eV, eW, eX, eY, eZ, e_, f0, f1, f2, f3, f4, f5, f6, f7, f8, f9, fa, fb, fc, fd, fe, ff, fg, fh, fi, fj, fk, fl, fm, fn, fo, fp, fq, fr, fs, ft, fu, fv, fw, fx, fy, fz, fA, fB, fC, fD, fE, fF, fG, fH, fI, fJ, fK, fL, fM, fN, fO, fP, fQ, fR, fS, fT, fU, fV, fW, fX, fY, fZ, f_, g0, g1, g2, g3, g4, g5, g6, g7, g8, g9, ga, gb, gc, gd, ge, gf, gg, gh, gi, gj, gk, gl, gm, gn, go, gp, gq, gr, gs, gt, gu, gv, gw, gx, gy, gz, gA, gB, gC, gD, gE, gF, gG, gH, gI, gJ, gK, gL, gM, gN, gO, gP, gQ, gR, gS, gT, gU, gV, gW, gX, gY, gZ, g_, h0, h1, h2, h3, h4, h5, h6, h7, h8, h9, ha, hb, hc, hd, he, hf, hg, hh, hi, hj, hk, hl, hm, hn, ho, hp, hq, hr, hs, ht, hu, hv, hw, hx, hy, hz, hA, hB, hC, hD, hE, hF, hG, hH, hI, hJ, hK, hL, hM, hN, hO, hP, hQ, hR, hS, hT, hU, hV, hW, hX, hY, hZ, h_, i0, i1, i2, i3, i4, i5, i6, i7, i8, i9, ia, ib, ic, id, ie, ig, ih, ii, ij, ik, il, im, io, ip, iq, ir, is, it, iu, iv, iw, ix, iy, iz, iA, iB, iC, iD, iE, iF, iG, iH, iI, iJ, iK, iL, iM, iN, iO, iP, iQ, iR, iS, iT, iU, iV, iW, iX, iY, iZ, i_, j0, j1, j2, j3, j4, j5, j6, j7, j8, j9, ja, jb, jc, jd, je, jf, jg, jh, ji, jj, jk, jl, jm, jn, jo, jp, jq, jr, js, jt, ju, jv, jw, jx, jy, jz, jA, jB, jC, jD, jE, jF, jG, jH, jI, jJ, jK, jL, jM, jN, jO, jP, jQ, jR, jS, jT, jU, jV, jW, jX, jY, jZ, j_, k0, k1, k2, k3, k4, k5, k6, k7, k8, k9, ka, kb, kc, kd, ke, kf, kg, kh, ki, kj, kk, kl, km, kn, ko, kp, kq, kr, ks, kt, ku, kv, kw, kx, ky, kz, kA, kB, kC, kD, kE, kF, kG, kH, kI, kJ, kK, kL, kM, kN, kO, kP, kQ, kR, kS, kT, kU, kV, kW, kX, kY, kZ, k_, l0, l1, l2, l3, l4, l5, l6, l7, l8, l9, la, lb, lc, ld, le, lf, lg, lh, li, lj, lk, ll, lm, ln, lo, lp, lq, lr, ls, lt, lu, lv, lw, lx, ly, lz, lA, lB, lC, lD, lE, lF, lG, lH, lI, lJ, lK, lL, lM, lN, lO, lP, lQ, lR, lS, lT, lU, lV, lW, lX, lY, lZ, l_, m0, m1, m2, m3, m4, m5, m6, m7, m8, m9, ma, mb, mc, md, me, mf, mg, mh, mi, mj, mk, ml, mm, mn, mo, mp, mq, mr, ms, mt, mu, mv, mw, mx, my, mz, mA, mB, mC, mD, mE, mF, mG, mH, mI, mJ, mK, mL, mM, mN, mO, mP, mQ, mR, mS, mT, mU, mV, mW, mX, mY, mZ, m_, n0, n1, n2, n3, n4, n5, n6, n7, n8, n9, na, nb, nc, nd, ne, nf, ng, nh, ni, nj, nk, nl, nm, nn, no, np, nq, nr, ns, nt, nu, nv, nw, nx, ny, nz, nA, nB, nC, nD, nE, nF, nG, nH, nI, nJ, nK, nL, nM, nN, nO, nP, nQ, nR, nS, nT, nU, nV, nW, nX, nY, nZ, n_, o0, o1, o2, o3, o4, o5, o6, o7, o8, o9, oa, ob, oc, od, oe, of, og, oh, oi, oj, ok, ol, om, on, oo, op, oq, os, ot, ou, ov, ow, ox, oy, oz, oA, oB, oC, oD, oE, oF, oG, oH, oI, oJ, oK, oL, oM, oN, oO, oP, oQ, oR, oS, oT, oU, oV, oW, oX, oY, oZ, o_, p0, p1, p2, p3, p4, p5, p6, p7, p8, p9, pa, pb, pc, pd, pe, pf, pg, ph, pi, pj, pk, pl, pm, pn, po, pp, pq, pr, ps, pt, pu, pv, pw, px, py, pz, pA, pB, pC, pD, pE, pF, pG, pH, pI, pJ, pK, pL, pM, pN, pO, pP, pQ, pR, pS, pT, pU, pV, pW, pX, pY, pZ, p_, q0, q1, q2, q3, q4, q5, q6, q7, q8, q9, qa, qb, qc, qd, qe, qf, qg, qh, qi, qj, qk, ql, qm, qn, qo, qp, qq, qr, qs, qt, qu, qv, qw, qx, qy, qz, qA, qB, qC, qD, qE, qF, qG, qH, qI, qJ, qK, qL, qM, qN, qO, qP, qQ, qR, qS, qT, qU, qV, qW, qX, qY, qZ, q_, r0, r1, r2, r3, r4, r5, r6, r7, r8, r9, ra, rb, rc, rd, re, rf, rg, rh, ri, rj, rk, rl, rm, rn, ro, rp, rq, rr, rs, rt, ru, rv, rw, rx, ry, rz, rA, rB, rC, rD, rE, rF, rG, rH, rI, rJ, rK, rL, rM, rN, rO, rP, rQ, rR, rS, rT, rU, rV, rW, rX, rY, rZ, r_, s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, sa, sb, sc, sd, se, sf, sg, sh, si, sj, sk, sl, sm, sn, so, sp, sq, sr, ss, st, su, sv, sw, sx, sy, sz, sA, sB, sC, sD, sE, sF, sG, sH, sI, sJ, sK, sL, sM, sN, sO, sP, sQ, sR, sS, sT, sU, sV, sW, sX, sY, sZ, s_, t0, t1, t2, t3, t4, t5, t6, t7, t8, t9, ta, tb, tc, td, te, tf, tg, th, ti, tj, tk, tl, tm, tn, to, tp, tq, tr, ts, tt, tu, tv, tw, tx, ty, tz, tA, tB, tC, tD, tE, tF, tG, tH, tI, tJ, tK, tL, tM, tN, tO, tP, tQ, tR, tS, tT, tU, tV, tW, tX, tY, tZ, t_, u0, u1, u2, u3, u4, u5, u6, u7, u8, u9, ua, ub, uc, ud, ue, uf, ug, uh, ui, uj, uk, ul, um, un, uo, up, uq, ur, us, ut, uu, uv, uw, ux, uy, uz, uA, uB, uC, uD, uE, uF, uG, uH, uI, uJ, uK, uL, uM, uN, uO, uP, uQ, uR, uS, uT, uU, uV, uW, uX, uY, uZ, u_, v0, v1, v2, v3, v4, v5, v6, v7, v8, v9, va, vb, vc, vd, ve, vf, vg, vh, vi, vj, vk, vl, vm, vn, vo, vp, vq, vr, vs, vt, vu, vv, vw, vx, vy, vz, vA, vB, vC, vD, vE, vF, vG, vH, vI, vJ, vK, vL, vM, vN, vO, vP, vQ, vR, vS, vT, vU, vV, vW, vX, vY, vZ, v_, w0, w1, w2, w3, w4, w5, w6, w7, w8, w9, wa, wb, wc, wd, we, wf, wg, wh, wi, wj, wk, wl, wm, wn, wo, wp, wq, wr, ws, wt, wu, wv, ww, wx, wy, wz, wA, wB, wC, wD, wE, wF, wG, wH, wI, wJ, wK, wL, wM, wN, wO, wP, wQ, wR, wS, wT, wU, wV, wW, wX, wY, wZ, w_, x0, x1, x2, x3, x4, x5, x6, x7, x8, x9, xa, xb, xc, xd, xe, xf, xg, xh, xi, xj, xk, xl, xm, xn, xo, xp, xq, xr, xs, xt, xu, xv, xw, xx, xy, xz, xA, xB, xC, xD, xE, xF, xG, xH, xI, xJ, xK, xL, xM, xN, xO, xP, xQ, xR, xS, xT, xU, xV, xW, xX, xY, xZ, x_, y0, y1, y2, y3, y4, y5, y6, y7, y8, y9, ya, yb, yc, yd, ye, yf, yg, yh, yi, yj, yk, yl, ym, yn, yo, yp, yq, yr, ys, yt, yu, yv, yw, yx, yy, yz, yA, yB, yC, yD, yE, yF, yG, yH, yI, yJ, yK, yL, yM, yN, yO, yP, yQ, yR, yS, yT, yU, yV, yW, yX, yY, yZ, y_, z0, z1, z2, z3, z4, z5, z6, z7, z8, z9, za, zb, zc, zd, ze, zf, zg, zh, zi, zj, zk, zl, zm, zn, zo, zp, zq, zr, zs, zt, zu, zv, zw, zx, zy, zz, zA, zB, zC, zD, zE, zF, zG, zH, zI, zJ, zK, zL, zM, zN, zO, zP, zQ, zR, zS, zT, zU, zV, zW, zX, zY, zZ, z_, A0, A1, A2, A3, A4, A5, A6, A7, A8, A9, Aa, Ab, Ac, Ad, Ae, Af, Ag, Ah, Ai, Aj, Ak, Al, Am, An, Ao, Ap, Aq, Ar, As, At, Au, Av, Aw, Ax, Ay, Az, AA, AB, AC, AD, AE, AF, AG, AH, AI, AJ, AK, AL, AM, AN, AO, AP, AQ, AR, AS, AT, AU, AV, AW, AX, AY, AZ, A_, B0, B1, B2, B3, B4, B5, B6, B7, B8, B9, Ba, Bb, Bc, Bd, Be, Bf, Bg, Bh, Bi, Bj, Bk, Bl, Bm, Bn, Bo, Bp, Bq, Br, Bs, Bt, Bu, Bv, Bw, Bx, By, Bz, BA, BB, BC, BD, BE, BF, BG, BH, BI, BJ, BK, BL, BM, BN, BO, BP, BQ, BR, BS, BT, BU, BV, BW, BX, BY, BZ, B_, C0, C1, C2, C3, C4, C5, C6, C7, C8, C9, Ca, Cb, Cc, Cd, Ce, Cf, Cg, Ch, Ci, Cj, Ck, Cl, Cm, Cn, Co, Cp, Cq, Cr, Cs, Ct, Cu, Cv, Cw, Cx, Cy, Cz, CA, CB, CC, CD, CE, CF, CG, CH, CI, CJ, CK, CL, CM, CN, CO, CP, CQ, CR, CS, CT, CU, CV, CW, CX, CY, CZ, C_, D0, D1, D2, D3, D4, D5, D6, D7, D8, D9, Da, Db, Dc, Dd, De, Df, Dg, Dh, Di, Dj, Dk, Dl, Dm, Dn, Do, Dp, Dq, Dr, Ds, Dt, Du, Dv, Dw, Dx, Dy, Dz, DA, DB, DC, DD, DE, DF, DG, DH, DI, DJ, DK, DL, DM, DN, DO, DP, DQ, DR, DS, DT, DU, DV, DW, DX, DY, DZ, D_, E0, E1, E2, E3, E4, E5, E6, E7, E8, E9, Ea, Eb, Ec, Ed, Ee, Ef, Eg, Eh, Ei, Ej, Ek, El, Em, En, Eo, Ep, Eq, Er, Es, Et, Eu, Ev, Ew, Ex, Ey, Ez, EA, EB, EC, ED, EE, EF, EG, EH, EI, EJ, EK, EL, EM, EN, EO, EP, EQ, ER, ES, ET, EU, EV, EW, EX, EY, EZ, E_, F0, F1, F2, F3, F4, F5, F6, F7, F8, F9, Fa, Fb, Fc, Fd, Fe, Ff, Fg, Fh, Fi, Fj, Fk, Fl, Fm, Fn, Fo, Fp, Fq, Fr, Fs, Ft, Fu, Fv, Fw, Fx, Fy, Fz, FA, FB, FC, FD, FE, FF, FG, FH, FI, FJ, FK, FL, FM, FN, FO, FP, FQ, FR, FS, FT, FU, FV, FW, FX, FY, FZ, F_, G0, G1, G2, G3, G4, G5, G6, G7, G8, G9, Ga, Gb, Gc, Gd, Ge, Gf, Gg, Gh, Gi, Gj, Gk, Gl, Gm, Gn, Go, Gp, Gq, Gr, Gs, Gt, Gu, Gv, Gw, Gx, Gy, Gz, GA, GB, GC, GD, GE, GF, GG, GH, GI, GJ, GK, GL, GM, GN, GO, GP, GQ, GR, GS, GT, GU, GV, GW, GX, GY, GZ, G_, H0, H1, H2, H3, H4, H5, H6, H7, H8, H9, Ha, Hb, Hc, Hd, He, Hf, Hg, Hh, Hi, Hj, Hk, Hl, Hm, Hn, Ho, Hp, Hq, Hr, Hs, Ht, Hu, Hv, Hw, Hx, Hy, Hz, HA, HB, HC, HD, HE, HF, HG, HH, HI, HJ, HK, HL, HM, HN, HO, HP, HQ, HR, HS, HT, HU, HV, HW, HX, HY, HZ, H_, I0, I1, I2, I3, I4, I5, I6, I7, I8, I9, Ia, Ib, Ic, Id, Ie, If, Ig, Ih, Ii, Ij, Ik, Il, Im, In, Io, Ip, Iq, Ir, Is, It, Iu, Iv, Iw, Ix, Iy, Iz, IA, IB, IC, ID, IE, IF, IG, IH, II, IJ, IK, IL, IM, IN, IO, IP, IQ, IR, IS, IT, IU, IV, IW, IX, IY, IZ, I_, J0, J1, J2, J3, J4, J5, J6, J7, J8, J9, Ja, Jb, Jc, Jd, Je, Jf, Jg, Jh, Ji, Jj, Jk, Jl, Jm, Jn, Jo, Jp, Jq, Jr, Js, Jt, Ju, Jv, Jw, Jx, Jy, Jz, JA, JB, JC, JD, JE, JF, JG, JH, JI, JJ, JK, JL, JM, JN, JO, JP, JQ, JR, JS, JT, JU, JV, JW, JX, JY, JZ, J_, K0, K1, K2, K3, K4, K5, K6, K7, K8, K9, Ka, Kb, Kc, Kd, Ke, Kf, Kg, Kh, Ki, Kj, Kk, Kl, Km, Kn, Ko, Kp, Kq, Kr, Ks, Kt, Ku, Kv, Kw, Kx, Ky, Kz, KA, KB, KC, KD, KE, KF, KG, KH, KI, KJ, KK, KL, KM, KN, KO, KP, KQ, KR, KS, KT, KU, KV, KW, KX, KY, KZ, K_, L0, L1, L2, L3, L4, L5, L6, L7, L8, L9, La, Lb, Lc, Ld, Le, Lf, Lg, Lh, Li, Lj, Lk, Ll, Lm, Ln, Lo, Lp, Lq, Lr, Ls, Lt, Lu, Lv, Lw, Lx, Ly, Lz, LA, LB, LC, LD, LE, LF, LG, LH, LI, LJ, LK, LL, LM, LN, LO, LP, LQ, LR, LS, LT, LU, LV, LW, LX, LY, LZ, L_, M0, M1, M2, M3, M4, M5, M6, M7, M8, M9, Ma, Mb, Mc, Md, Me, Mf, Mg, Mh, Mi, Mj, Mk, Ml, Mm, Mn, Mo, Mp, Mq, Mr, Ms, Mt, Mu, Mv, Mw, Mx, My, Mz, MA, MB, MC, MD, ME, MF, MG, MH, MI, MJ, MK, ML, MM, MN, MO, MP, MQ, MR, MS, MT, MU, MV, MW, MX, MY, MZ, M_, N0, N1, N2, N3, N4, N5, N6, N7, N8, N9, Na, Nb, Nc, Nd, Ne, Nf, Ng, Nh, Ni, Nj, Nk, Nl, Nm, Nn, No, Np, Nq, Nr, Ns, Nt, Nu, Nv, Nw, Nx, Ny, Nz, NA, NB, NC, ND, NE, NF, NG, NH, NI, NJ, NK, NL, NM, NN, NO, NP, NQ, NR, NS, NT, NU, NV, NW, NX, NY, NZ, N_, O0, O1, O2, O3, O4, O5, O6, O7, O8, O9, Oa, Ob, Oc, Od, Oe, Of, Og, Oh, Oi, Oj, Ok, Ol, Om, On, Oo, Op, Oq, Or, Os, Ot, Ou, Ov, Ow, Ox, Oy, Oz, OA, OB, OC, OD, OE, OF, OG, OH, OI, OJ, OK, OL, OM, ON, OO, OP, OQ, OR, OS, OT, OU, OV, OW, OX, OY, OZ, O_, P0, P1, P2, P3, P4, P5, P6, P7, P8, P9, Pa, Pb, Pc, Pd, Pe, Pf, Pg, Ph, Pi, Pj, Pk, Pl, Pm, Pn, Po, Pp, Pq, Pr, Ps, Pt, Pu, Pv, Pw, Px, Py, Pz, PA, PB, PC, PD, PE, PF, PG, PH, PI, PJ, PK, PL, PM, PN, PO, PP, PQ, PR, PS, PT, PU, PV, PW, PX, PY, PZ, P_, Q0, Q1, Q2, Q3, Q4, Q5, Q6, Q7, Q8, Q9, Qa, Qb, Qc, Qd, Qe, Qf, Qg, Qh, Qi, Qj, Qk, Ql, Qm, Qn, Qo, Qp, Qq, Qr, Qs, Qt, Qu, Qv, Qw, Qx, Qy, Qz, QA, QB, QC, QD, QE, QF, QG, QH, QI, QJ, QK, QL, QM, QN, QO, QP, QQ, QR, QS, QT, QU, QV, QW, QX, QY, QZ, Q_, R0, R1, R2, R3, R4, R5, R6, R7, R8, R9, Ra, Rb, Rc, Rd, Re, Rf, Rg, Rh, Ri, Rj, Rk, Rl, Rm, Rn, Ro, Rp, Rq, Rr, Rs, Rt, Ru, Rv, Rw, Rx, Ry, Rz, RA, RB, RC, RD, RE, RF, RG, RH, RI, RJ, RK, RL, RM, RN, RO, RP, RQ, RR, RS, RT, RU, RV, RW, RX, RY, RZ, R_, S0, S1, S2, S3, S4, S5, S6, S7, S8, S9, Sa, Sb, Sc, Sd, Se, Sf, Sg, Sh, Si, Sj, Sk, Sl, Sm, Sn, So, Sp, Sq, Sr, Ss, St, Su, Sv, Sw, Sx, Sy, Sz, SA, SB, SC, SD, SE, SF, SG, SH, SI, SJ, SK, SL, SM, SN, SO, SP, SQ, SR, SS, ST, SU, SV, SW, SX, SY, SZ, S_, T0, T1, T2, T3, T4, T5, T6, T7, T8, T9, Ta, Tb, Tc, Td, Te, Tf, Tg, Th, Ti, Tj, Tk, Tl, Tm, Tn, To, Tp, Tq, Tr, Ts, Tt, Tu, Tv, Tw, Tx, Ty, Tz, TA, TB, TC, TD, TE, TF, TG, TH, TI, TJ, TK, TL, TM, TN, TO, TP, TQ, TR, TS, TT, TU, TV, TW, TX, TY, TZ, T_, U0, U1, U2, U3, U4, U5, U6, U7, U8, U9, Ua, Ub, Uc, Ud, Ue, Uf, Ug, Uh, Ui, Uj, Uk, Ul, Um, Un, Uo, Up, Uq, Ur, Us, Ut, Uu, Uv, Uw, Ux, Uy, Uz, UA, UB, UC, UD, UE, UF, UG, UH, UI, UJ, UK, UL, UM, UN, UO, UP, UQ, UR, US, UT, UU, UV, UW, UX, UY, UZ, U_, V0, V1, V2, V3, V4, V5, V6, V7, V8, V9, Va, Vb, Vc, Vd, Ve, Vf, Vg, Vh, Vi, Vj, Vk, Vl, Vm, Vn, Vo, Vp, Vq, Vr, Vs, Vt, Vu, Vv, Vw, Vx, Vy, Vz, VA, VB, VC, VD, VE, VF, VG, VH, VI, VJ, VK, VL, VM, VN, VO, VP, VQ, VR, VS, VT, VU, VV, VW, VX, VY, VZ, V_, W0, W1, W2, W3, W4, W5, W6, W7, W8, W9, Wa, Wb, Wc, Wd, We, Wf, Wg, Wh, Wi, Wj, Wk, Wl, Wm, Wn, Wo, Wp, Wq, Wr, Ws, Wt, Wu, Wv, Ww, Wx, Wy, Wz, WA, WB, WC, WD, WE, WF, WG, WH, WI, WJ, WK, WL, WM, WN, WO, WP, WQ, WR, WS, WT, WU, WV, WW, WX, WY, WZ, W_, X0, X1, X2, X3, X4, X5, X6, X7, X8, X9, Xa, Xb, Xc, Xd, Xe, Xf, Xg, Xh, Xi, Xj, Xk, Xl, Xm, Xn, Xo, Xp, Xq, Xr, Xs, Xt, Xu, Xv, Xw, Xx, Xy, Xz, XA, XB, XC, XD, XE, XF, XG, XH, XI, XJ, XK, XL, XM, XN, XO, XP, XQ, XR, XS, XT, XU, XV, XW, XX, XY, XZ, X_, Y0, Y1, Y2, Y3, Y4, Y5, Y6, Y7, Y8, Y9, Ya, Yb, Yc, Yd, Ye, Yf, Yg, Yh, Yi, Yj, Yk, Yl, Ym, Yn, Yo, Yp, Yq, Yr, Ys, Yt, Yu, Yv, Yw, Yx, Yy, Yz, YA, YB, YC, YD, YE, YF, YG, YH, YI, YJ, YK, YL, YM, YN, YO, YP, YQ, YR, YS, YT, YU, YV, YW, YX, YY, YZ, Y_, Z0, Z1, Z2, Z3, Z4, Z5, Z6, Z7, Z8, Z9, Za, Zb, Zc, Zd, Ze, Zf, Zg, Zh, Zi, Zj, Zk, Zl, Zm, Zn, Zo, Zp, Zq, Zr, Zs, Zt, Zu, Zv, Zw, Zx, Zy, Zz, ZA, ZB, ZC, ZD, ZE, ZF, ZG, ZH, ZI, ZJ, ZK, ZL, ZM, ZN, ZO, ZP, ZQ, ZR, ZS, ZT, ZU, ZV, ZW, ZX, ZY, ZZ, Z_, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _A, _B, _C, _D, _E, _F, _G, _H, _I, _J, _K, _L, _M, _N, _O, _P, _Q, _R, _S, _T, _U, _V, _W, _X, _Y, _Z, __, a00, a01, a02 = 1; print(dontrenameme)',
				'minified': 'a,a0=1;local b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z,A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z,_,a1,a2,a3,a4,a5,a6,a7,a8,a9,aa,ab,ac,ad,ae,af,ag,ah,ai,aj,ak,al,am,an,ao,ap,aq,ar,as,at,au,av,aw,ax,ay,az,aA,aB,aC,aD,aE,aF,aG,aH,aI,aJ,aK,aL,aM,aN,aO,aP,aQ,aR,aS,aT,aU,aV,aW,aX,aY,aZ,a_,b0,b1,b2,b3,b4,b5,b6,b7,b8,b9,ba,bb,bc,bd,be,bf,bg,bh,bi,bj,bk,bl,bm,bn,bo,bp,bq,br,bs,bt,bu,bv,bw,bx,by,bz,bA,bB,bC,bD,bE,bF,bG,bH,bI,bJ,bK,bL,bM,bN,bO,bP,bQ,bR,bS,bT,bU,bV,bW,bX,bY,bZ,b_,c0,c1,c2,c3,c4,c5,c6,c7,c8,c9,ca,cb,cc,cd,ce,cf,cg,ch,ci,cj,ck,cl,cm,cn,co,cp,cq,cr,cs,ct,cu,cv,cw,cx,cy,cz,cA,cB,cC,cD,cE,cF,cG,cH,cI,cJ,cK,cL,cM,cN,cO,cP,cQ,cR,cS,cT,cU,cV,cW,cX,cY,cZ,c_,d0,d1,d2,d3,d4,d5,d6,d7,d8,d9,da,db,dc,dd,de,df,dg,dh,di,dj,dk,dl,dm,dn,dp,dq,dr,ds,dt,du,dv,dw,dx,dy,dz,dA,dB,dC,dD,dE,dF,dG,dH,dI,dJ,dK,dL,dM,dN,dO,dP,dQ,dR,dS,dT,dU,dV,dW,dX,dY,dZ,d_,e0,e1,e2,e3,e4,e5,e6,e7,e8,e9,ea,eb,ec,ed,ee,ef,eg,eh,ei,ej,ek,el,em,en,eo,ep,eq,er,es,et,eu,ev,ew,ex,ey,ez,eA,eB,eC,eD,eE,eF,eG,eH,eI,eJ,eK,eL,eM,eN,eO,eP,eQ,eR,eS,eT,eU,eV,eW,eX,eY,eZ,e_,f0,f1,f2,f3,f4,f5,f6,f7,f8,f9,fa,fb,fc,fd,fe,ff,fg,fh,fi,fj,fk,fl,fm,fn,fo,fp,fq,fr,fs,ft,fu,fv,fw,fx,fy,fz,fA,fB,fC,fD,fE,fF,fG,fH,fI,fJ,fK,fL,fM,fN,fO,fP,fQ,fR,fS,fT,fU,fV,fW,fX,fY,fZ,f_,g0,g1,g2,g3,g4,g5,g6,g7,g8,g9,ga,gb,gc,gd,ge,gf,gg,gh,gi,gj,gk,gl,gm,gn,go,gp,gq,gr,gs,gt,gu,gv,gw,gx,gy,gz,gA,gB,gC,gD,gE,gF,gG,gH,gI,gJ,gK,gL,gM,gN,gO,gP,gQ,gR,gS,gT,gU,gV,gW,gX,gY,gZ,g_,h0,h1,h2,h3,h4,h5,h6,h7,h8,h9,ha,hb,hc,hd,he,hf,hg,hh,hi,hj,hk,hl,hm,hn,ho,hp,hq,hr,hs,ht,hu,hv,hw,hx,hy,hz,hA,hB,hC,hD,hE,hF,hG,hH,hI,hJ,hK,hL,hM,hN,hO,hP,hQ,hR,hS,hT,hU,hV,hW,hX,hY,hZ,h_,i0,i1,i2,i3,i4,i5,i6,i7,i8,i9,ia,ib,ic,id,ie,ig,ih,ii,ij,ik,il,im,io,ip,iq,ir,is,it,iu,iv,iw,ix,iy,iz,iA,iB,iC,iD,iE,iF,iG,iH,iI,iJ,iK,iL,iM,iN,iO,iP,iQ,iR,iS,iT,iU,iV,iW,iX,iY,iZ,i_,j0,j1,j2,j3,j4,j5,j6,j7,j8,j9,ja,jb,jc,jd,je,jf,jg,jh,ji,jj,jk,jl,jm,jn,jo,jp,jq,jr,js,jt,ju,jv,jw,jx,jy,jz,jA,jB,jC,jD,jE,jF,jG,jH,jI,jJ,jK,jL,jM,jN,jO,jP,jQ,jR,jS,jT,jU,jV,jW,jX,jY,jZ,j_,k0,k1,k2,k3,k4,k5,k6,k7,k8,k9,ka,kb,kc,kd,ke,kf,kg,kh,ki,kj,kk,kl,km,kn,ko,kp,kq,kr,ks,kt,ku,kv,kw,kx,ky,kz,kA,kB,kC,kD,kE,kF,kG,kH,kI,kJ,kK,kL,kM,kN,kO,kP,kQ,kR,kS,kT,kU,kV,kW,kX,kY,kZ,k_,l0,l1,l2,l3,l4,l5,l6,l7,l8,l9,la,lb,lc,ld,le,lf,lg,lh,li,lj,lk,ll,lm,ln,lo,lp,lq,lr,ls,lt,lu,lv,lw,lx,ly,lz,lA,lB,lC,lD,lE,lF,lG,lH,lI,lJ,lK,lL,lM,lN,lO,lP,lQ,lR,lS,lT,lU,lV,lW,lX,lY,lZ,l_,m0,m1,m2,m3,m4,m5,m6,m7,m8,m9,ma,mb,mc,md,me,mf,mg,mh,mi,mj,mk,ml,mm,mn,mo,mp,mq,mr,ms,mt,mu,mv,mw,mx,my,mz,mA,mB,mC,mD,mE,mF,mG,mH,mI,mJ,mK,mL,mM,mN,mO,mP,mQ,mR,mS,mT,mU,mV,mW,mX,mY,mZ,m_,n0,n1,n2,n3,n4,n5,n6,n7,n8,n9,na,nb,nc,nd,ne,nf,ng,nh,ni,nj,nk,nl,nm,nn,no,np,nq,nr,ns,nt,nu,nv,nw,nx,ny,nz,nA,nB,nC,nD,nE,nF,nG,nH,nI,nJ,nK,nL,nM,nN,nO,nP,nQ,nR,nS,nT,nU,nV,nW,nX,nY,nZ,n_,o0,o1,o2,o3,o4,o5,o6,o7,o8,o9,oa,ob,oc,od,oe,of,og,oh,oi,oj,ok,ol,om,on,oo,op,oq,os,ot,ou,ov,ow,ox,oy,oz,oA,oB,oC,oD,oE,oF,oG,oH,oI,oJ,oK,oL,oM,oN,oO,oP,oQ,oR,oS,oT,oU,oV,oW,oX,oY,oZ,o_,p0,p1,p2,p3,p4,p5,p6,p7,p8,p9,pa,pb,pc,pd,pe,pf,pg,ph,pi,pj,pk,pl,pm,pn,po,pp,pq,pr,ps,pt,pu,pv,pw,px,py,pz,pA,pB,pC,pD,pE,pF,pG,pH,pI,pJ,pK,pL,pM,pN,pO,pP,pQ,pR,pS,pT,pU,pV,pW,pX,pY,pZ,p_,q0,q1,q2,q3,q4,q5,q6,q7,q8,q9,qa,qb,qc,qd,qe,qf,qg,qh,qi,qj,qk,ql,qm,qn,qo,qp,qq,qr,qs,qt,qu,qv,qw,qx,qy,qz,qA,qB,qC,qD,qE,qF,qG,qH,qI,qJ,qK,qL,qM,qN,qO,qP,qQ,qR,qS,qT,qU,qV,qW,qX,qY,qZ,q_,r0,r1,r2,r3,r4,r5,r6,r7,r8,r9,ra,rb,rc,rd,re,rf,rg,rh,ri,rj,rk,rl,rm,rn,ro,rp,rq,rr,rs,rt,ru,rv,rw,rx,ry,rz,rA,rB,rC,rD,rE,rF,rG,rH,rI,rJ,rK,rL,rM,rN,rO,rP,rQ,rR,rS,rT,rU,rV,rW,rX,rY,rZ,r_,s0,s1,s2,s3,s4,s5,s6,s7,s8,s9,sa,sb,sc,sd,se,sf,sg,sh,si,sj,sk,sl,sm,sn,so,sp,sq,sr,ss,st,su,sv,sw,sx,sy,sz,sA,sB,sC,sD,sE,sF,sG,sH,sI,sJ,sK,sL,sM,sN,sO,sP,sQ,sR,sS,sT,sU,sV,sW,sX,sY,sZ,s_,t0,t1,t2,t3,t4,t5,t6,t7,t8,t9,ta,tb,tc,td,te,tf,tg,th,ti,tj,tk,tl,tm,tn,to,tp,tq,tr,ts,tt,tu,tv,tw,tx,ty,tz,tA,tB,tC,tD,tE,tF,tG,tH,tI,tJ,tK,tL,tM,tN,tO,tP,tQ,tR,tS,tT,tU,tV,tW,tX,tY,tZ,t_,u0,u1,u2,u3,u4,u5,u6,u7,u8,u9,ua,ub,uc,ud,ue,uf,ug,uh,ui,uj,uk,ul,um,un,uo,up,uq,ur,us,ut,uu,uv,uw,ux,uy,uz,uA,uB,uC,uD,uE,uF,uG,uH,uI,uJ,uK,uL,uM,uN,uO,uP,uQ,uR,uS,uT,uU,uV,uW,uX,uY,uZ,u_,v0,v1,v2,v3,v4,v5,v6,v7,v8,v9,va,vb,vc,vd,ve,vf,vg,vh,vi,vj,vk,vl,vm,vn,vo,vp,vq,vr,vs,vt,vu,vv,vw,vx,vy,vz,vA,vB,vC,vD,vE,vF,vG,vH,vI,vJ,vK,vL,vM,vN,vO,vP,vQ,vR,vS,vT,vU,vV,vW,vX,vY,vZ,v_,w0,w1,w2,w3,w4,w5,w6,w7,w8,w9,wa,wb,wc,wd,we,wf,wg,wh,wi,wj,wk,wl,wm,wn,wo,wp,wq,wr,ws,wt,wu,wv,ww,wx,wy,wz,wA,wB,wC,wD,wE,wF,wG,wH,wI,wJ,wK,wL,wM,wN,wO,wP,wQ,wR,wS,wT,wU,wV,wW,wX,wY,wZ,w_,x0,x1,x2,x3,x4,x5,x6,x7,x8,x9,xa,xb,xc,xd,xe,xf,xg,xh,xi,xj,xk,xl,xm,xn,xo,xp,xq,xr,xs,xt,xu,xv,xw,xx,xy,xz,xA,xB,xC,xD,xE,xF,xG,xH,xI,xJ,xK,xL,xM,xN,xO,xP,xQ,xR,xS,xT,xU,xV,xW,xX,xY,xZ,x_,y0,y1,y2,y3,y4,y5,y6,y7,y8,y9,ya,yb,yc,yd,ye,yf,yg,yh,yi,yj,yk,yl,ym,yn,yo,yp,yq,yr,ys,yt,yu,yv,yw,yx,yy,yz,yA,yB,yC,yD,yE,yF,yG,yH,yI,yJ,yK,yL,yM,yN,yO,yP,yQ,yR,yS,yT,yU,yV,yW,yX,yY,yZ,y_,z0,z1,z2,z3,z4,z5,z6,z7,z8,z9,za,zb,zc,zd,ze,zf,zg,zh,zi,zj,zk,zl,zm,zn,zo,zp,zq,zr,zs,zt,zu,zv,zw,zx,zy,zz,zA,zB,zC,zD,zE,zF,zG,zH,zI,zJ,zK,zL,zM,zN,zO,zP,zQ,zR,zS,zT,zU,zV,zW,zX,zY,zZ,z_,A0,A1,A2,A3,A4,A5,A6,A7,A8,A9,Aa,Ab,Ac,Ad,Ae,Af,Ag,Ah,Ai,Aj,Ak,Al,Am,An,Ao,Ap,Aq,Ar,As,At,Au,Av,Aw,Ax,Ay,Az,AA,AB,AC,AD,AE,AF,AG,AH,AI,AJ,AK,AL,AM,AN,AO,AP,AQ,AR,AS,AT,AU,AV,AW,AX,AY,AZ,A_,B0,B1,B2,B3,B4,B5,B6,B7,B8,B9,Ba,Bb,Bc,Bd,Be,Bf,Bg,Bh,Bi,Bj,Bk,Bl,Bm,Bn,Bo,Bp,Bq,Br,Bs,Bt,Bu,Bv,Bw,Bx,By,Bz,BA,BB,BC,BD,BE,BF,BG,BH,BI,BJ,BK,BL,BM,BN,BO,BP,BQ,BR,BS,BT,BU,BV,BW,BX,BY,BZ,B_,C0,C1,C2,C3,C4,C5,C6,C7,C8,C9,Ca,Cb,Cc,Cd,Ce,Cf,Cg,Ch,Ci,Cj,Ck,Cl,Cm,Cn,Co,Cp,Cq,Cr,Cs,Ct,Cu,Cv,Cw,Cx,Cy,Cz,CA,CB,CC,CD,CE,CF,CG,CH,CI,CJ,CK,CL,CM,CN,CO,CP,CQ,CR,CS,CT,CU,CV,CW,CX,CY,CZ,C_,D0,D1,D2,D3,D4,D5,D6,D7,D8,D9,Da,Db,Dc,Dd,De,Df,Dg,Dh,Di,Dj,Dk,Dl,Dm,Dn,Do,Dp,Dq,Dr,Ds,Dt,Du,Dv,Dw,Dx,Dy,Dz,DA,DB,DC,DD,DE,DF,DG,DH,DI,DJ,DK,DL,DM,DN,DO,DP,DQ,DR,DS,DT,DU,DV,DW,DX,DY,DZ,D_,E0,E1,E2,E3,E4,E5,E6,E7,E8,E9,Ea,Eb,Ec,Ed,Ee,Ef,Eg,Eh,Ei,Ej,Ek,El,Em,En,Eo,Ep,Eq,Er,Es,Et,Eu,Ev,Ew,Ex,Ey,Ez,EA,EB,EC,ED,EE,EF,EG,EH,EI,EJ,EK,EL,EM,EN,EO,EP,EQ,ER,ES,ET,EU,EV,EW,EX,EY,EZ,E_,F0,F1,F2,F3,F4,F5,F6,F7,F8,F9,Fa,Fb,Fc,Fd,Fe,Ff,Fg,Fh,Fi,Fj,Fk,Fl,Fm,Fn,Fo,Fp,Fq,Fr,Fs,Ft,Fu,Fv,Fw,Fx,Fy,Fz,FA,FB,FC,FD,FE,FF,FG,FH,FI,FJ,FK,FL,FM,FN,FO,FP,FQ,FR,FS,FT,FU,FV,FW,FX,FY,FZ,F_,G0,G1,G2,G3,G4,G5,G6,G7,G8,G9,Ga,Gb,Gc,Gd,Ge,Gf,Gg,Gh,Gi,Gj,Gk,Gl,Gm,Gn,Go,Gp,Gq,Gr,Gs,Gt,Gu,Gv,Gw,Gx,Gy,Gz,GA,GB,GC,GD,GE,GF,GG,GH,GI,GJ,GK,GL,GM,GN,GO,GP,GQ,GR,GS,GT,GU,GV,GW,GX,GY,GZ,G_,H0,H1,H2,H3,H4,H5,H6,H7,H8,H9,Ha,Hb,Hc,Hd,He,Hf,Hg,Hh,Hi,Hj,Hk,Hl,Hm,Hn,Ho,Hp,Hq,Hr,Hs,Ht,Hu,Hv,Hw,Hx,Hy,Hz,HA,HB,HC,HD,HE,HF,HG,HH,HI,HJ,HK,HL,HM,HN,HO,HP,HQ,HR,HS,HT,HU,HV,HW,HX,HY,HZ,H_,I0,I1,I2,I3,I4,I5,I6,I7,I8,I9,Ia,Ib,Ic,Id,Ie,If,Ig,Ih,Ii,Ij,Ik,Il,Im,In,Io,Ip,Iq,Ir,Is,It,Iu,Iv,Iw,Ix,Iy,Iz,IA,IB,IC,ID,IE,IF,IG,IH,II,IJ,IK,IL,IM,IN,IO,IP,IQ,IR,IS,IT,IU,IV,IW,IX,IY,IZ,I_,J0,J1,J2,J3,J4,J5,J6,J7,J8,J9,Ja,Jb,Jc,Jd,Je,Jf,Jg,Jh,Ji,Jj,Jk,Jl,Jm,Jn,Jo,Jp,Jq,Jr,Js,Jt,Ju,Jv,Jw,Jx,Jy,Jz,JA,JB,JC,JD,JE,JF,JG,JH,JI,JJ,JK,JL,JM,JN,JO,JP,JQ,JR,JS,JT,JU,JV,JW,JX,JY,JZ,J_,K0,K1,K2,K3,K4,K5,K6,K7,K8,K9,Ka,Kb,Kc,Kd,Ke,Kf,Kg,Kh,Ki,Kj,Kk,Kl,Km,Kn,Ko,Kp,Kq,Kr,Ks,Kt,Ku,Kv,Kw,Kx,Ky,Kz,KA,KB,KC,KD,KE,KF,KG,KH,KI,KJ,KK,KL,KM,KN,KO,KP,KQ,KR,KS,KT,KU,KV,KW,KX,KY,KZ,K_,L0,L1,L2,L3,L4,L5,L6,L7,L8,L9,La,Lb,Lc,Ld,Le,Lf,Lg,Lh,Li,Lj,Lk,Ll,Lm,Ln,Lo,Lp,Lq,Lr,Ls,Lt,Lu,Lv,Lw,Lx,Ly,Lz,LA,LB,LC,LD,LE,LF,LG,LH,LI,LJ,LK,LL,LM,LN,LO,LP,LQ,LR,LS,LT,LU,LV,LW,LX,LY,LZ,L_,M0,M1,M2,M3,M4,M5,M6,M7,M8,M9,Ma,Mb,Mc,Md,Me,Mf,Mg,Mh,Mi,Mj,Mk,Ml,Mm,Mn,Mo,Mp,Mq,Mr,Ms,Mt,Mu,Mv,Mw,Mx,My,Mz,MA,MB,MC,MD,ME,MF,MG,MH,MI,MJ,MK,ML,MM,MN,MO,MP,MQ,MR,MS,MT,MU,MV,MW,MX,MY,MZ,M_,N0,N1,N2,N3,N4,N5,N6,N7,N8,N9,Na,Nb,Nc,Nd,Ne,Nf,Ng,Nh,Ni,Nj,Nk,Nl,Nm,Nn,No,Np,Nq,Nr,Ns,Nt,Nu,Nv,Nw,Nx,Ny,Nz,NA,NB,NC,ND,NE,NF,NG,NH,NI,NJ,NK,NL,NM,NN,NO,NP,NQ,NR,NS,NT,NU,NV,NW,NX,NY,NZ,N_,O0,O1,O2,O3,O4,O5,O6,O7,O8,O9,Oa,Ob,Oc,Od,Oe,Of,Og,Oh,Oi,Oj,Ok,Ol,Om,On,Oo,Op,Oq,Or,Os,Ot,Ou,Ov,Ow,Ox,Oy,Oz,OA,OB,OC,OD,OE,OF,OG,OH,OI,OJ,OK,OL,OM,ON,OO,OP,OQ,OR,OS,OT,OU,OV,OW,OX,OY,OZ,O_,P0,P1,P2,P3,P4,P5,P6,P7,P8,P9,Pa,Pb,Pc,Pd,Pe,Pf,Pg,Ph,Pi,Pj,Pk,Pl,Pm,Pn,Po,Pp,Pq,Pr,Ps,Pt,Pu,Pv,Pw,Px,Py,Pz,PA,PB,PC,PD,PE,PF,PG,PH,PI,PJ,PK,PL,PM,PN,PO,PP,PQ,PR,PS,PT,PU,PV,PW,PX,PY,PZ,P_,Q0,Q1,Q2,Q3,Q4,Q5,Q6,Q7,Q8,Q9,Qa,Qb,Qc,Qd,Qe,Qf,Qg,Qh,Qi,Qj,Qk,Ql,Qm,Qn,Qo,Qp,Qq,Qr,Qs,Qt,Qu,Qv,Qw,Qx,Qy,Qz,QA,QB,QC,QD,QE,QF,QG,QH,QI,QJ,QK,QL,QM,QN,QO,QP,QQ,QR,QS,QT,QU,QV,QW,QX,QY,QZ,Q_,R0,R1,R2,R3,R4,R5,R6,R7,R8,R9,Ra,Rb,Rc,Rd,Re,Rf,Rg,Rh,Ri,Rj,Rk,Rl,Rm,Rn,Ro,Rp,Rq,Rr,Rs,Rt,Ru,Rv,Rw,Rx,Ry,Rz,RA,RB,RC,RD,RE,RF,RG,RH,RI,RJ,RK,RL,RM,RN,RO,RP,RQ,RR,RS,RT,RU,RV,RW,RX,RY,RZ,R_,S0,S1,S2,S3,S4,S5,S6,S7,S8,S9,Sa,Sb,Sc,Sd,Se,Sf,Sg,Sh,Si,Sj,Sk,Sl,Sm,Sn,So,Sp,Sq,Sr,Ss,St,Su,Sv,Sw,Sx,Sy,Sz,SA,SB,SC,SD,SE,SF,SG,SH,SI,SJ,SK,SL,SM,SN,SO,SP,SQ,SR,SS,ST,SU,SV,SW,SX,SY,SZ,S_,T0,T1,T2,T3,T4,T5,T6,T7,T8,T9,Ta,Tb,Tc,Td,Te,Tf,Tg,Th,Ti,Tj,Tk,Tl,Tm,Tn,To,Tp,Tq,Tr,Ts,Tt,Tu,Tv,Tw,Tx,Ty,Tz,TA,TB,TC,TD,TE,TF,TG,TH,TI,TJ,TK,TL,TM,TN,TO,TP,TQ,TR,TS,TT,TU,TV,TW,TX,TY,TZ,T_,U0,U1,U2,U3,U4,U5,U6,U7,U8,U9,Ua,Ub,Uc,Ud,Ue,Uf,Ug,Uh,Ui,Uj,Uk,Ul,Um,Un,Uo,Up,Uq,Ur,Us,Ut,Uu,Uv,Uw,Ux,Uy,Uz,UA,UB,UC,UD,UE,UF,UG,UH,UI,UJ,UK,UL,UM,UN,UO,UP,UQ,UR,US,UT,UU,UV,UW,UX,UY,UZ,U_,V0,V1,V2,V3,V4,V5,V6,V7,V8,V9,Va,Vb,Vc,Vd,Ve,Vf,Vg,Vh,Vi,Vj,Vk,Vl,Vm,Vn,Vo,Vp,Vq,Vr,Vs,Vt,Vu,Vv,Vw,Vx,Vy,Vz,VA,VB,VC,VD,VE,VF,VG,VH,VI,VJ,VK,VL,VM,VN,VO,VP,VQ,VR,VS,VT,VU,VV,VW,VX,VY,VZ,V_,W0,W1,W2,W3,W4,W5,W6,W7,W8,W9,Wa,Wb,Wc,Wd,We,Wf,Wg,Wh,Wi,Wj,Wk,Wl,Wm,Wn,Wo,Wp,Wq,Wr,Ws,Wt,Wu,Wv,Ww,Wx,Wy,Wz,WA,WB,WC,WD,WE,WF,WG,WH,WI,WJ,WK,WL,WM,WN,WO,WP,WQ,WR,WS,WT,WU,WV,WW,WX,WY,WZ,W_,X0,X1,X2,X3,X4,X5,X6,X7,X8,X9,Xa,Xb,Xc,Xd,Xe,Xf,Xg,Xh,Xi,Xj,Xk,Xl,Xm,Xn,Xo,Xp,Xq,Xr,Xs,Xt,Xu,Xv,Xw,Xx,Xy,Xz,XA,XB,XC,XD,XE,XF,XG,XH,XI,XJ,XK,XL,XM,XN,XO,XP,XQ,XR,XS,XT,XU,XV,XW,XX,XY,XZ,X_,Y0,Y1,Y2,Y3,Y4,Y5,Y6,Y7,Y8,Y9,Ya,Yb,Yc,Yd,Ye,Yf,Yg,Yh,Yi,Yj,Yk,Yl,Ym,Yn,Yo,Yp,Yq,Yr,Ys,Yt,Yu,Yv,Yw,Yx,Yy,Yz,YA,YB,YC,YD,YE,YF,YG,YH,YI,YJ,YK,YL,YM,YN,YO,YP,YQ,YR,YS,YT,YU,YV,YW,YX,YY,YZ,Y_,Z0,Z1,Z2,Z3,Z4,Z5,Z6,Z7,Z8,Z9,Za,Zb,Zc,Zd,Ze,Zf,Zg,Zh,Zi,Zj,Zk,Zl,Zm,Zn,Zo,Zp,Zq,Zr,Zs,Zt,Zu,Zv,Zw,Zx,Zy,Zz,ZA,ZB,ZC,ZD,ZE,ZF,ZG,ZH,ZI,ZJ,ZK,ZL,ZM,ZN,ZO,ZP,ZQ,ZR,ZS,ZT,ZU,ZV,ZW,ZX,ZY,ZZ,Z_,_0,_1,_2,_3,_4,_5,_6,_7,_8,_9,_a,_b,_c,_d,_e,_f,_g,_h,_i,_j,_k,_l,_m,_n,_o,_p,_q,_r,_s,_t,_u,_v,_w,_x,_y,_z,_A,_B,_C,_D,_E,_F,_G,_H,_I,_J,_K,_L,_M,_N,_O,_P,_Q,_R,_S,_T,_U,_V,_W,_X,_Y,_Z,__,a00,a01,a02=1;print(dontrenameme)'
			},
			{
				'description': 'Identifier in MemberExpression',
				'original': 'local x = y() print(x.someProperty)',
				'minified': 'local a=y()print(a.someProperty)'
			},
			{
				'description': 'Identifier in MemberExpression',
				'original': 'local x = y() print(x["someProperty"])',
				'minified': 'local a=y()print(a["someProperty"])'
			},
			{
				'description': 'Identifier in MemberExpression',
				'original': 'local x = y() print(x:someProperty())',
				'minified': 'local a=y()print(a:someProperty())'
			},
			{
				'description': 'Variable shortening should not shorten `self` in a function',
				'original': 'local t = {num = 2} function t:func() return self.num end',
				'minified': 'local a={num=2}function a:func()return self.num end'
			}
		],

		// TableKey
		'TableKey': [
			{
				'description': 'TableKeyString',
				'original': 'function f(x) end function g(y) local h = { x = y } end',
				'minified': 'function f(a)end;function g(b)local c={x=b}end',
			}
		],

		// Miscellaneous
		'Miscellaneous': [
			{
				'description': 'Empty input',
				'original': '',
				'minified': ''
			},
			{
				'description': 'Passing an AST',
				'original': {'type':'Chunk','body':[{'type':'AssignmentStatement','variables':[{'type':'Identifier','name':'a','isLocal':false}],'init':[{'type':'NumericLiteral','value':42,'raw':'42'}]}],'comments':[],'globals':[{'type':'Identifier','name':'a','isLocal':false}]},
				'minified': 'a=42'
			}
		],

		// Error handling
		'Error handling': [
			{
				'description': 'Unknown statement type: `LolStatement`',
				'original': {'type':'Chunk','body':[{'type':'LolStatement','variables':[{'type':'Identifier','name':'a','isLocal':false}],'init':[{'type':'NumericLiteral','value':42,'raw':'42'}]}],'comments':[],'globals':[{'type':'Identifier','name':'a','isLocal':false}]},
				'error': TypeError
			},
			{
				'description': 'Unknown expression type: `LolExpression`',
				'original': {'type':'Chunk','body':[{'type':'AssignmentStatement','variables':[{'type':'LolExpression','name':'a','isLocal':false}],'init':[{'type':'NumericLiteral','value':42,'raw':'42'}]}],'comments':[],'globals':[{'type':'Identifier','name':'a','isLocal':false}]},
				'error': TypeError
			},
			{
				'description': 'Missing required AST property: `globals`',
				'original': {'type':'Chunk','body':[{'type':'AssignmentStatement','variables':[{'type':'Identifier','name':'a'}],'init':[{'type':'NumericLiteral','value':42,'raw':'42'}]}],'comments':[]},
				'error': Error
			}
		]
	};

	function forEach(array, fn) {
		var index = -1;
		var length = array.length;
		while (++index < length) {
			fn(array[index]);
		}
	}

	function forOwn(object, fn) {
		var key;
		for (key in object) {
			if (object.hasOwnProperty(key)) {
				fn(object[key], key);
			}
		}
	}

	// explicitly call `QUnit.module()` instead of `module()`
	// in case we are in a CLI environment

	// `throws` is a reserved word in ES3; alias it to avoid errors
	var raises = QUnit.assert['throws'];

	// Extend `Object.prototype` to see if luamin can handle it
	Object.prototype.preserveIdentifiers = true;

	QUnit.module('luamin');
	forOwn(data, function(items, groupName) {
		test(groupName, function() {
			if (groupName == 'Error handling') {
				forEach(items, function(item) {
					raises(
						function() {
							minify(item.original);
						},
						item.error,
						item.description
					);
				});
			} else {
				forEach(items, function(item) {
					equal(
						minify(item.original),
						item.minified,
						item.description
					);
				});
			}
		});
	});

	/*--------------------------------------------------------------------------*/

	// configure QUnit and call `QUnit.start()` for
	// Narwhal, Node.js, PhantomJS, Rhino, and RingoJS
	if (!root.document || root.phantom) {
		QUnit.config.noglobals = true;
		QUnit.start();
	}
}(typeof global == 'object' && global || this));
