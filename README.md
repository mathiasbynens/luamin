# luamin, a Lua minifier written in JavaScript

luamin uses the excellent [luaparse](http://oxyc.github.com/luaparse/) library to parse Lua code into an Abstract Syntax Tree. Based on that AST, luamin then generates a (hopefully) more compact yet semantically equivalent Lua program.

luamin was inspired by the [LuaMinify](https://github.com/stravant/LuaMinify) and [esmangle](https://github.com/Constellation/esmangle) projects.

Feel free to fork if you see possible improvements!

## Installation and usage

In a browser:

~~~html
<script src="luamin.js"></script>
~~~

Via [npm](http://npmjs.org/):

~~~bash
npm install luamin
~~~

In [Narwhal](http://narwhaljs.org/), [Node.js](http://nodejs.org/), and [RingoJS](http://ringojs.org/):

~~~js
var luamin = require('luamin');
~~~

In [Rhino](http://www.mozilla.org/rhino/):

~~~js
load('luamin.js');
~~~

Using an AMD loader like [RequireJS](http://requirejs.org/):

~~~js
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
~~~

Usage example:

~~~js
var luaCode = 'a = ((1 + 2) - 3) * (4 / (5 ^ 6)) -- foo';
luamin.minify(luaCode); // 'a=(1+2-3)*4/5^6'

// `minify` also accepts luaparse-compatible ASTs as its argument:
var ast = luaparse.parse(luaCode, { 'scope': true });
luamin.minify(ast); // 'a=(1+2-3)*4/5^6'
~~~

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

luamin has been tested in at least Chrome 27, Firefox 3-19, Safari 4-6, Opera 10-12, IE 6-10, Node.js v0.10.0, Narwhal 0.3.2, RingoJS 0.8-0.9, and Rhino 1.7RC4.

## Unit tests & code coverage

After cloning this repository, run `npm install --dev` to install the dependencies needed for luamin development and testing. You may want to install Istanbul _globally_ using `npm install istanbul -g`.

Once that’s done, you can run the unit tests in Node using `npm test` or `node tests/tests.js`. To run the tests in Rhino, Ringo, Narwhal, and web browsers as well, use `grunt test`.

To generate [the code coverage report](http://rawgithub.com/mathiasbynens/luamin/master/coverage/luamin/luamin.js.html), use `grunt cover`.

## Author

[Mathias Bynens](http://mathiasbynens.be/)
  [![twitter/mathias](http://gravatar.com/avatar/24e08a9ea84deb17ae121074d0f17125?s=70)](http://twitter.com/mathias "Follow @mathias on Twitter")

## License

luamin is dual licensed under the [MIT](http://mths.be/mit) and [GPL](http://mths.be/gpl) licenses.
