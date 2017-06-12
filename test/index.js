var chai = require('chai');
var assert = chai.assert;
var split = require('./../dist/split-node');
var path = require('path');
var join = path.join;

// run plugin
var plugin = split();

describe('description', () => {

  it('split is an function', () => {
    assert.isFunction(split, 'split is an function.');
  });

  it('it returns an object', () => {
    assert.isObject(plugin, 'plugin is an object.');
  });

  it('removes prefixes from urls in html', done => {
    var doc = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title></title>
      </head>
      <body>
        <template>
          <link rel="stylesheet" href="test.html_.css">
          <script src="test.html_.js"></script>
        </template>
      </body>
    </html>
    `;

    plugin.html({path: 'index.html', contents: doc}).then(result => {
      assert.lengthOf(result.contents, 271);
      done();
    });
  });

  it('it removes prefix from css', done => {
    plugin.css({path: 'test.html_.css', contents: ''}).then(result => {
      assert.equal(result.path, 'test.css', 'url prefix is removed with succes.');
      done();
    });
  });

  it('it removes prefix from js', done => {
    plugin.js({path: 'test.html_.js', contents: ''}).then(result => {
      assert.equal(result.path, 'test.js', 'url prefix is removed with succes.');
      done();
    });
  });

});
