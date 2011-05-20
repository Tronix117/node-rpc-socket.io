/**
 * Module dependencies.
 */
 
var paths={
  controllers: __dirname + '/controllers',
  models: __dirname + '/models',
  public: __dirname + '/public',
  views: __dirname + '/views'
};

var express = require('express')
    app = module.exports = express.createServer(),
    utils = require(paths.models+'/extanding/utils.js'),
    io = require(paths.models+'/extanding/rpc.socket.io.js'),
    controllers = require(paths.controllers);

// Configuration
app.configure(function(){
  app.set('views', paths.views);
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'One2tHr33F0uRf!vE' }));
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

app.get('/', controllers.Chat.get_index);
//app.get('/fs/ls/:path', require(paths.controllers+'/filesystem.js').Filesystem.listDir);
//app.get(/^\/ls\/fs(\/.+)?\??$/, controllers.Filesystem.get_listDir);

// Only listen on $ node app.js
if (!module.parent) {
  app.listen(3000);
  console.log("Express server listening on port %d", app.address().port);
  
  var socket = io.listen(app); 
  socket.on('connection', function(client){ 
    controllers.Chat.rpc_INIT(client);
    /*
    client.on('message', function(message){
    
    }); 
    client.on('disconnect', function(){
    
    }); */
  }); 
}
