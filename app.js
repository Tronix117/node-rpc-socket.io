// Paths
var paths={
  controllers: __dirname + '/controllers',
  models: __dirname + '/models',
  extends: __dirname + '/models/extends',
  public: __dirname + '/public',
  views: __dirname + '/views'
};

// Dependencies
var express = require('express')
    app = module.exports = express.createServer(),
    utils = require(paths.extends + '/utils.js'),
    io = require(paths.extends + '/rpc.socket.io.js'),
    controllers = require(paths.controllers);

// Configuration
app.configure(function(){
  app.set('views', paths.views);
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'ItsForG!tHuB' }));
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

// Routing
app.get('/', controllers.Chat.get_index); //only one route to print the chat webpage

// Server and Sockets
if (!module.parent) {
  app.listen(3000);
  console.log("Express server listening on port %d", app.address().port);
  
  var socket = io.listen(app); 
  socket.on('connection', function(client){ 
    controllers.Chat.rpc_INIT(client);
  }); 
}
