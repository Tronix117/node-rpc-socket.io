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
    utils = require(paths.extends + '/utils.js'), //only additionals function, I have'nt find a proper clone method for object in node.js, but I'm sure there's one, so if you can send me a message to tell me how I can use a built-in one, I will be very pleased !
    io = require(paths.extends + '/rpc.socket.io.js'), //we don't require socket.io.js (you can, but you'd also have to load rpc.socket.io.js), but our modified version, which return the socket.io instance
    controllers = require(paths.controllers); //my own way to work and separating of files, don't pay a big attention at that, it was just a 5mins coding

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
    controllers.Chat.rpc_INIT(client); //don't forget to prepare our RPC here, in the controllers/chat.js file
  }); 
}
