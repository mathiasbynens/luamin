# luamin, a Lua minifier written in JavaScript

[![Build status](https://travis-ci.org/mathiasbynens/luamin.svg?branch=master)](https://travis-ci.org/mathiasbynens/luamin) [![Dependency status](https://gemnasium.com/mathiasbynens/luamin.svg)](https://gemnasium.com/mathiasbynens/luamin)

luamin uses the excellent [luaparse](https://oxyc.github.io/luaparse/) library to parse Lua code into an Abstract Syntax Tree. Based on that AST, luamin then generates a (hopefully) more compact yet semantically equivalent Lua program. [Here’s an online demo.](https://mothereff.in/lua-minifier)

luamin was inspired by the [LuaMinify](https://github.com/stravant/LuaMinify) and [Esmangle](https://github.com/Constellation/esmangle) projects.

Feel free to fork if you see possible improvements!

## Installation and usage

Via [npm](https://www.npmjs.com/):

```bash
npm install luamin
```

Via [Bower](http://bower.io/):

```bash
bower install luamin
```

Via [Component](https://github.com/component/component):

```bash
component install mathiasbynens/luamin
```

In a browser:

```html
<script src="luamin.js"></script>
```

In [Narwhal](http://narwhaljs.org/), [Node.js](https://nodejs.org/), and [RingoJS](http://ringojs.org/):

```js
var luamin = require('luamin');
```

In [Rhino](http://www.mozilla.org/rhino/):

```js
load('luamin.js');
```

Using an AMD loader like [RequireJS](http://requirejs.org/):

```js
require(
  {
    'paths': {
      'luamin': 'path/to/luamin'
    }
  },
  ['luamin'],
  function(luamin) {
    console.log(luamin);
  }
);
```

Usage example:

```js
var luaCode = 'a = ((1 + 2) - 3) * (4 / (5 ^ 6)) -- foo';
luamin.minify(luaCode); // 'a=(1+2-3)*4/5^6'

// `minify` also accepts luaparse-compatible ASTs as its argument:
var ast = luaparse.parse(luaCode, { 'scope': true });
luamin.minify(ast); // 'a=(1+2-3)*4/5^6'
```

### Using the `luamin` binary

To use the `luamin` binary in your shell, simply install luamin globally using npm:

```bash
npm install -g luamin
```

After that you will be able to minify Lua scripts from the command line:

```bash
$ luamin -c 'a = ((1 + 2) - 3) * (4 / (5 ^ 6))'
a=(1+2-3)*4/5^6
$ luamin -f foo.lua
a=(1+2-3)*4/5^6
```

See `luamin --help` for the full list of options.

## Support

luamin has been tested in at least Chrome 25-48, Firefox 3-44, Safari 4-9, Opera 10-35, IE 6-11, Edge, Node.js v0.10.0–v5, Narwhal 0.3.2, RingoJS 0.8-0.11, PhantomJS 1.9.0, and Rhino 1.7.6.

## Unit tests & code coverage

After cloning this repository, run `npm install` to install the dependencies needed for luamin development and testing. You may want to install Istanbul _globally_ using `npm install istanbul -g`.

Once that’s done, you can run the unit tests in Node using `npm test` or `node tests/tests.js`. To run the tests in Rhino, Ringo, Narwhal, and web browsers as well, use `grunt test`.

To generate [the code coverage report](http://rawgithub.com/mathiasbynens/luamin/master/coverage/luamin/luamin.js.html), use `grunt cover`.

## Author

| [![twitter/mathias](https://gravatar.com/avatar/24e08a9ea84deb17ae121074d0f17125?s=70)](https://twitter.com/mathias "Follow @mathias on Twitter") |
|---|
| [Mathias Bynens](https://mathiasbynens.be/) |

## License

luamin is available under the [MIT](https://mths.be/mit) license.
