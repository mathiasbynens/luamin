# luamin, a Lua minifier written in JavaScript

***Work in progress.***

luamin uses the excellent [luaparse](http://oxyc.github.com/luaparse/) library to parse Lua code into an Abstract Syntax Tree. Based on that AST, luamin then generates a (hopefully) more compact yet semantically equivalent Lua program.

Feel free to fork if you see possible improvements!

## Code coverage report

An [Istanbul](https://github.com/gotwarlost/istanbul)-generated code coverage report for `luamin.js` can be found in the `coverage/luamin` directory. [Here’s an online copy of that report.](http://rawgithub.com/mathiasbynens/luamin/master/coverage/luamin/luamin.js.html)

## Authors

* [Mathias Bynens](http://mathiasbynens.be/)
  [![twitter/mathias](http://gravatar.com/avatar/24e08a9ea84deb17ae121074d0f17125?s=70)](http://twitter.com/mathias "Follow @mathias on Twitter")

## License

luamin is dual licensed under the [MIT](http://mths.be/mit) and [GPL](http://mths.be/gpl) licenses.
