# Node-RPC-Socket.io - Implementation of JSON-RPC over socket.io

  It's easy to use socket.io, but it work only in one way : server to client or client to server.
  JSON-RPC is a standard that allow a client to ask an answer from the server, with standard JSON structure for request and response. With socket.io, the server can also call an RPC answer from the client.
  
  Currently, I've only made a client package for websites in javascript, but I'm working on a full cocoa implementation of the client for iOS or OSX apps. Coming soon...
  
## Features

  - Very simple to use
  - Client can ask Server but Server can also ask Client
  - Asynchronous callbacks
  - Exceptions are fully compatible with the JSON-RPC standard and can be interpreted by the Error callback client side (or server side)
  - Can also Broadcast an RPC message to all clients or all with exceptions (in this way, no response can be handled by the server, it works only like a notification)
  
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
It's not necessary to require `socket.io`, in fact `rpc.socket.io.js` already include it>