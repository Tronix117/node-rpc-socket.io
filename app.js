/**
 * Module dependencies.
 */

var express = require('express')
    fs = require('fs'),
    app = module.exports = express.createServer();

var paths={
  controllers: __dirname + '/controllers',
  models: __dirname + '/models',
  public: __dirname + '/public',
  views: __dirname + '/views'
};

Object.defineProperty(Object.prototype, "extend", {
    enumerable: false,
    value: function(from) {
        var props = Object.getOwnPropertyNames(from);
        var dest = this;
        props.forEach(function(name) {
                var destination = Object.getOwnPropertyDescriptor(from, name);
                Object.defineProperty(dest, name, destination);
        });
        return this;
    }
});

var controllers={};//=require(paths.controllers);
var files=fs.readdirSync( paths.controllers)
files.forEach(function(file) {
  controllers.extend(require( paths.controllers+'/'+file));
});

// Configuration
app.configure(function(){
  app.set('views', paths.views);
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'One2tHr33F0uRf!vE' }));
  //app.use(express.compiler({ src: __dirname + '/public', enable: ['sass'] }));
  app.use(app.router);
  app.use(require('stylus').middleware({ src: paths.public }));
  app.use(express.static(paths.public));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

app.get('/', controllers.Index.index);
//app.get('/fs/ls/:path', require(paths.controllers+'/filesystem.js').Filesystem.listDir);
app.get(/^\/ls\/fs(\/.+)?\??$/, require(paths.controllers+'/filesystem.js').Filesystem.listDir);

// Only listen on $ node app.js
if (!module.parent) {
  app.listen(3000);
  console.log("Express server listening on port %d", app.address().port);
}
