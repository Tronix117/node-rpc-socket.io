# Node-RPC-Socket.io - Implementation of JSON-RPC over socket.io

  It's easy to use socket.io, but it work only in one way : server to client or client to server.
  JSON-RPC is a standard that allow a client to ask an answer from the server, with standard JSON structure for request and response. With socket.io, the server can also call an RPC answer from the client.
  
  Currently, I've only made a client package for websites in javascript, but I'm working on a full cocoa implementation of the client for iOS or OSX apps. Coming soon...
  
## Features

  - Very simple to use
  - Client can ask Server but Server can also ask Client
  - Asynchronous callbacks
  - Exceptions are fully compatible with the JSON-RPC standard and can be interpreted by the `Error callback` client side (or server side)
  - Can also Broadcast an RPC message to all clients or all with exceptions (in this way, no response can be handled by the server, it works only like a notification)
  - Compatible all webbrowsers since ie5.5 (same compatibility as socket.io)
  
## Installation

### Prerequiste

You first need to install socket.io 

    npm install -i socket.io

### Client-Side

```html
  <script type="text/javascript" src="/socket.io/socket.io.js"></script>
  <script type="text/javascript" src="/javascripts/rpc.socket.io.js"></script>
```

### Server-Side
```javascript
  var io = require('rpc.socket.io.js');
```
It's not necessary to require `socket.io`, in fact `rpc.socket.io.js` already include it.

## Use

### Server-Side

```javascript
  //function used later, you can jump after and let's come back when it'll be called
  var checkAuthz = function(params,client,next){
    if(!params.password || !params.user || params.user!='admin' || params.password!='toor')
      throw new {code:'UNAUTHORIZED',message:'Your are not enough powerfull to access to this information'};
    return next(); //pass throught the next callback function (the one just bellow) and return it
  }

  var socket = io.listen(app); //app is the server created with http.createServer or the express.createServer of express.js
  socket.on('connection', function(client){
    //here, there's a new client, it's time to listen to the call of a method from the client
    
    //First of all, we are going to send the current time when the client will request "getRemoteTime"
    client.listenRPC('getRemoteTime',checkAuthz, /*for checkAuthz see at the top*/
      function(params){
        return (new Date()).getTime();
      }
    );
    
    //We send a banner to the client
    client.callRPC('banner',{time:(new Date()).getTime(), message:'Welcome to you !'});
    
    //We send an information message to all OTHER clients
    client.broadcastNotifyRPC('notification',{code:'NEWUSER', message:'A new user is connected'});
  });
```

### Client-Side

```javascript
  var socket = new io.Socket('127.0.0.1'), //address and port of the websocket server, check socket.io for more help
      showNotification = function(notif){
        alert(notif.message);
      };
  
  socket
    .listenRPC('banner', function(params){
      if(params.time && params.message)
        alert(params.message);
    })
    .listenRPC('notification',showNotification);
  
  document.getElementById('btn').onClick=function(){
    socket.callRPC('getRemoteTime',{user:'admin', password:'toor'},{
      success: function(result){
        alert('The remote time is ' + result);
      },
      error: function(err){
        switch(err.code){
          case 'UNAUTHORIZED':
            alert(err.message);
          break;
          case 'CALLRPCTIMEOUT':
            alert('Please check your network, server doesn't seem to respond');
          break;
          default:
            alert('Unknown Error !');
          break;
        }
      }
    });
  }
  
  //finaly we launch the socket
  socket.connect();
```

### Running

Now let's start the server and open a webbrowser window on the client-side page. Normaly, once time the client is loaded and connected, the server must send a `banner` method to the client and the client will print in an alert box the `params.message`. If we open a new tab on the same page in the webbrowser, the first one will show a new alert, the `notification` one, saying that a new user is connected. If we click on a button with the `id` = `btn`, then the `callRPC('getRemoteTime')` will be reach and the server will respond with the correct time and the `success` callback will be fire. If we change the `password` to another, the server will throw an error, and it's the `error` callback which will be fired.

## Tutorial / Example

I've included an example of a chat (yes another one, I know :P), this chat is based on express.js with jade and stylus.


```
  git clone git://github.com/Tronix117/node-rpc-socket.io.git
  cd node-rpc-socket.io/example
  npm install -i
  node app.js
```

Then go, in more than one tab of your webbrowser, to this url : `http://127.0.0.1:3000` and enjoy !
Files are commented and should be simple to understand.
