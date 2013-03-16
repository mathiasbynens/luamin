var minify = require('./../luamin').minify;
var equal = require('assert').equal;

var testData = [

	// Assignments
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
	},

	// Comments
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
		'original': '--[[comment]]--break',
		'minified': 'break'
	},
	{
		'description': 'Comment + BreakStatement',
		'original': '--[=[comment]=]--break',
		'minified': 'break'
	},
	{
		'description': 'Comment + BreakStatement',
		'original': '--[===[comment\n--[=[sub]=]--\n]===]--break',
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
	},

	// Conditionals
	{
		'description': 'IfStatement',
		'original': 'if 1 then end',
		'minified': 'if 1 then end'
	},
	{
		'description': 'IfStatement + LocalStatement',
		'original': 'if 1 then local a end',
		'minified': 'if 1 then local a end'
	},
	{
		'description': 'IfStatement + LocalStatement',
		'original': 'if 1 then local a local b end',
		'minified': 'if 1 then local a;local b end'
	},
	{
		'description': 'IfStatement + LocalStatement',
		'original': 'if 1 then local a; local b; end',
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
		'original': 'if 1 then local a else local b end',
		'minified': 'if 1 then local a else local b end'
	},
	{
		'description': 'IfStatement + ElseClause + LocalStatement',
		'original': 'if 1 then local a; else local b; end',
		'minified': 'if 1 then local a else local b end'
	},
	{
		'description': 'IfStatement + ElseifClause + LocalStatement',
		'original': 'if 1 then local a elseif 2 then local b end',
		'minified': 'if 1 then local a elseif 2 then local b end'
	},
	{
		'description': 'IfStatement + ElseifClause + LocalStatement',
		'original': 'if 1 then local a; elseif 2 then local b; end',
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
	},

	// DoStatement
	{
		'description': 'DoStatement + LocalStatement',
		'original': 'do local a local b end',
		'minified': 'do local a;local b end'
	},
	{
		'description': 'DoStatement + LocalStatement',
		'original': 'do local a; local b; end',
		'minified': 'do local a;local b end'
	},
	{
		'description': 'DoStatement + LocalStatement',
		'original': 'do local a = 1 end',
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
	},

	// Expressions
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
		'original': 'a = a.b',
		'minified': 'a=a.b'
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
		'original': 'a = a.b[c]',
		'minified': 'a=a.b[c]'
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
		'original': 'a = (a).c',
		'minified': 'a=a.c'
	},
	{
		'description': 'AssignmentStatement + MemberExpression + CallExpression',
		'original': 'a = a.b()',
		'minified': 'a=a.b()'
	},
	{
		'description': 'AssignmentStatement + IndexExpression + CallExpression',
		'original': 'a = a[b]()',
		'minified': 'a=a[b]()'
	},
	{
		'description': 'AssignmentStatement + MemberExpression + CallExpression',
		'original': 'a = a:b()',
		'minified': 'a=a:b()'
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
		'minified': 'a=function(p)end'
	},
	{
		'description': 'AssignmentStatement + FunctionDeclaration',
		'original': 'a = function(p,q,r) end',
		'minified': 'a=function(p,q,r)end'
	},
	{
		'description': 'AssignmentStatement + FunctionDeclaration',
		'original': 'a = function(...) end',
		'minified': 'a=function(...)end'
	},
	{
		'description': 'AssignmentStatement + FunctionDeclaration',
		'original': 'a = function(p, ...) end',
		'minified': 'a=function(p,...)end'
	},
	{
		'description': 'Assignments + FunctionDeclaration',
		'original': 'a = function(p, q, r, ...) end',
		'minified': 'a=function(p,q,r,...)end'
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

	// ForGenericStatement + ForNumericStatement
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
	},

	// Function calls
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
		'minified': '"foo"()'
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
	},

	// FunctionDeclaration
	{
		'description': 'FunctionDeclaration',
		'original': 'function a() end',
		'minified': 'function a()end'
	},
	{
		'description': 'FunctionDeclaration',
		'original': 'function a(p) end',
		'minified': 'function a(p)end'
	},
	{
		'description': 'FunctionDeclaration',
		'original': 'function a(p, q, r) end',
		'minified': 'function a(p,q,r)end'
	},
	{
		'description': 'FunctionDeclaration + ReturnStatement',
		'original': 'function a(p) return end',
		'minified': 'function a(p)return end'
	},
	{
		'description': 'FunctionDeclaration + DoStatement',
		'original': 'function a(p) do end end',
		'minified': 'function a(p)do end end'
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
		'minified': 'function a(p,...)end'
	},
	{
		'description': 'FunctionDeclaration',
		'original': 'function a(p, q, r, ...) end',
		'minified': 'function a(p,q,r,...)end'
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

	// Literals
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
	},

	// Escape sequences
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
	},

	// LocalStatement
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
		'minified': 'local function a(p)end'
	},
	{
		'description': 'LocalStatement',
		'original': 'local function a(p,q,r) end',
		'minified': 'local function a(p,q,r)end'
	},
	{
		'description': 'LocalStatement',
		'original': 'local function a(p) return end',
		'minified': 'local function a(p)return end'
	},
	{
		'description': 'LocalStatement',
		'original': 'local function a(p) do end end',
		'minified': 'local function a(p)do end end'
	},
	{
		'description': 'LocalStatement',
		'original': 'local function a(...) end',
		'minified': 'local function a(...)end'
	},
	{
		'description': 'LocalStatement',
		'original': 'local function a(p,...) end',
		'minified': 'local function a(p,...)end'
	},
	{
		'description': 'LocalStatement',
		'original': 'local function a(p,q,r,...) end',
		'minified': 'local function a(p,q,r,...)end'
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
	},

	// Operators
	{
		'description': '',
		'original': 'a = -10',
		'minified': 'a=-10'
	},
	{
		'description': '',
		'original': 'a = -"foo"',
		'minified': 'a=-"foo"'
	},
	{
		'description': '',
		'original': 'a = -a',
		'minified': 'a=-a'
	},
	{
		'description': '',
		'original': 'a = -nil',
		'minified': 'a=-nil'
	},
	{
		'description': '',
		'original': 'a = -true',
		'minified': 'a=-true'
	},
	{
		'description': '',
		'original': 'a = -{}',
		'minified': 'a=-{}'
	},
	{
		'description': '',
		'original': 'a = -function() end',
		'minified': 'a=-function()end'
	},
	{
		'description': '',
		'original': 'a = -a()',
		'minified': 'a=-a()'
	},
	{
		'description': '',
		'original': 'a = -(a)',
		'minified': 'a=-a'
	},
	{
		'description': '',
		'original': 'a = not 10',
		'minified': 'a=not 10'
	},
	{
		'description': '',
		'original': 'a = not "foo"',
		'minified': 'a=not"foo"'
	},
	{
		'description': '',
		'original': 'a = not a',
		'minified': 'a=not a'
	},
	{
		'description': '',
		'original': 'a = not nil',
		'minified': 'a=not nil'
	},
	{
		'description': '',
		'original': 'a = not true',
		'minified': 'a=not true'
	},
	{
		'description': '',
		'original': 'a = not {}',
		'minified': 'a=not{}'
	},
	{
		'description': '',
		'original': 'a = not function() end',
		'minified': 'a=not function()end'
	},
	{
		'description': '',
		'original': 'a = not a()',
		'minified': 'a=not a()'
	},
	{
		'description': '',
		'original': 'a = not (a)',
		'minified': 'a=not a'
	},
	{
		'description': '',
		'original': 'a = 1 + 2; a = 1 - 2',
		'minified': 'a=1+2;a=1-2'
	},
	{
		'description': '',
		'original': 'a = 1 * 2; a = 1 / 2',
		'minified': 'a=1*2;a=1/2'
	},
	{
		'description': '',
		'original': 'a = 1 ^ 2; a = 1 .. 2',
		'minified': 'a=1^2;a=1 ..2'
	},
	{
		'description': '',
		'original': 'a = 1 + -2; a = 1 - -2',
		'minified': 'a=1+-2;a=1- -2'
	},
	{
		'description': '',
		'original': 'a = 1 * not 2; a = 1 / not 2',
		'minified': 'a=1*not 2;a=1/not 2'
	},
	{
		'description': '',
		'original': 'a = 1 + 2 - 3 * 4 / 5 ^ 6',
		'minified': 'a=1+2-3*4/5^6'
	},
	{
		'description': '',
		'original': 'a = a + b - c',
		'minified': 'a=a+b-c'
	},
	{
		'description': '',
		'original': 'a = "foo" + "bar"',
		'minified': 'a="foo"+"bar"'
	},
	{
		'description': '',
		'original': 'a = "foo".."bar".."baz"',
		'minified': 'a="foo".."bar".."baz"'
	},
	{
		'description': '',
		'original': 'a = true + false - nil',
		'minified': 'a=true+false-nil'
	},
	{
		'description': '',
		'original': 'a = {} * {}',
		'minified': 'a={}*{}'
	},
	{
		'description': '',
		'original': 'a = function() end / function() end',
		'minified': 'a=function()end/function()end'
	},
	{
		'description': '',
		'original': 'a = a() ^ b()',
		'minified': 'a=a()^b()'
	},
	{
		'description': '',
		'original': 'a = 1 == 2; a = 1 ~= 2',
		'minified': 'a=1==2;a=1~=2'
	},
	{
		'description': '',
		'original': 'a = 1 < 2; a = 1 <= 2',
		'minified': 'a=1<2;a=1<=2'
	},
	{
		'description': '',
		'original': 'a = 1 > 2; a = 1 >= 2',
		'minified': 'a=1>2;a=1>=2'
	},
	{
		'description': '',
		'original': 'a = 1 < 2 < 3',
		'minified': 'a=1<2<3'
	},
	{
		'description': '',
		'original': 'a = 1 >= 2 >= 3',
		'minified': 'a=1>=2>=3'
	},
	{
		'description': '',
		'original': 'a = "foo" == "bar"',
		'minified': 'a="foo"=="bar"'
	},
	{
		'description': '',
		'original': 'a = "foo" > "bar"',
		'minified': 'a="foo">"bar"'
	},
	{
		'description': '',
		'original': 'a = a ~= b',
		'minified': 'a=a~=b'
	},
	{
		'description': '',
		'original': 'a = true == false',
		'minified': 'a=true==false'
	},
	{
		'description': '',
		'original': 'a = 1 and 2; a = 1 or 2',
		'minified': 'a=1 and 2;a=1 or 2'
	},
	{
		'description': '',
		'original': 'a = 1 and 2 and 3',
		'minified': 'a=1 and 2 and 3'
	},
	{
		'description': '',
		'original': 'a = 1 or 2 or 3',
		'minified': 'a=1 or 2 or 3'
	},
	{
		'description': '',
		'original': 'a = 1 and 2 or 3',
		'minified': 'a=1 and 2 or 3'
	},
	{
		'description': '',
		'original': 'a = a and b or c',
		'minified': 'a=a and b or c'
	},
	{
		'description': '',
		'original': 'a = a() and (b)() or c.d',
		'minified': 'a=a()and b()or c.d'
	},
	{
		'description': '',
		'original': 'a = "foo" and "bar"',
		'minified': 'a="foo"and"bar"'
	},
	{
		'description': '',
		'original': 'a = true or false',
		'minified': 'a=true or false'
	},
	{
		'description': '',
		'original': 'a = {} and {} or {}',
		'minified': 'a={}and{}or{}'
	},
	{
		'description': '',
		'original': 'a = (1) and ("foo") or (nil)',
		'minified': 'a=1 and"foo"or nil'
	},
	{
		'description': '',
		'original': 'a = function() end == function() end',
		'minified': 'a=function()end==function()end'
	},
	{
		'description': '',
		'original': 'a = function() end or function() end',
		'minified': 'a=function()end or function()end'
	},
	{
		'description': '',
		'original': 'a = true or false and nil',
		'minified': 'a=true or false and nil'
	},
	{
		'description': '',
		'original': 'a = 2^-2 == 1/4 and -2^- -2 == - - -4',
		'minified': 'a=2^-2==1/4 and-2^- -2==- - -4'
	},
	{
		'description': '',
		'original': 'a = -3-1-5 == 0+0-9',
		'minified': 'a=-3-1-5==0+0-9'
	},

	// Operator precedence
	// http://www.lua.org/manual/5.1/manual.html#2.5.6
	{
		'description': '',
		'original': 'a = (1 + 2) * 3',
		'minified': 'a=(1+2)*3'
	},
	{
		'description': '',
		'original': 'a = ((1 + 2) - 3) * (4 / (5 ^ 6))',
		'minified': 'a=(1+2-3)*4/5^6'
	},
	{
		'description': '',
		'original': 'a = (1 + (2 - (3 * (4 / (5 ^ ((6)))))))',
		'minified': 'a=1+2-3*4/5^6'
	},
	{
		'description': '',
		'original': 'a = (((1 or false) and true) or false) == true',
		'minified': 'a=((1 or false)and true or false)==true'
	},
	{
		'description': '',
		'original': 'a = (((nil and true) or false) and true) == false',
		'minified': 'a=((nil and true or false)and true)==false'
	},
	{
		'description': '',
		'original': 'a = not ((true or false) and nil)',
		'minified': 'a=not((true or false)and nil)'
	},
	{
		'description': '',
		'original': 'a = -2^2 == -4 and (-2)^2 == 4 and 2*2-3-1 == 0',
		'minified': 'a=-2^2==-4 and(-2)^2==4 and 2*2-3-1==0'
	},
	{
		'description': '',
		'original': 'a = 2*1+3/3 == 3 and 1+2 .. 3*1 == "33"',
		'minified': 'a=2*1+3/3==3 and 1+2 ..3*1=="33"'
	},
	{
		'description': '',
		'original': 'a = not nil and 2 and not(2 > 3 or 3 < 2)',
		'minified': 'a=not nil and 2 and not(2>3 or 3<2)'
	},
	{
		'description': '',
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

	// RepeatStatement
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
		'description': '',
		'original': 'repeat do return end until 0',
		'minified': 'repeat do return end until 0'
	},
	{
		'description': '',
		'original': 'repeat do break end until 0',
		'minified': 'repeat do break end until 0'
	},

	// ReturnStatement
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
	},

	// Statements
	{
		'description': 'BreakStatement',
		'original': 'break',
		'minified': 'break'
	},
	{
		'description': 'LabelStatement',
		'original': '::foo::',
		'minified': '::foo::'
	},
	{
		'description': 'GotoStatement',
		'original': 'goto foo',
		'minified': 'goto foo'
	},

	// TableConstructorExpressions
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

	// WhileStatement
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
	},

	// TODO: rename local variables

	// Miscellaneous
	{
		'description': 'Empty input',
		'original': '',
		'minified': ''
	}

];

testData.forEach(function(test, index) {
	try {
		equal(minify(test.original), test.minified, test.description);
	} catch(error) {
		console.log('Test #%d: %s', index, test.description);
		console.log('expected: %s', test.minified);
		console.log('     got: %s', minify(test.original));
	}
});
