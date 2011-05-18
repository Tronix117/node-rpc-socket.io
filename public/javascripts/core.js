io.Socket.prototype.uid=0;
io.Socket.prototype.uniqId=function(){
console.log(this.transport);
  if(!this.uid)
    return this.uid=this.transport.sessionid+''+(new Date()).getTime();
  return this.uid++;
}
io.Socket.prototype.sendRPC=function(method,params,callback){
  this.send({method:method,params:params,id:this.uniqId()});
}

var socket = new io.Socket('127.0.0.1'); 

socket.connect();
socket.on('connect', function(){console.log('Connected');});
socket.on('message', function(message){console.log(message);});
socket.on('disconnect', function(){console.log('Disconnected');});

socket.sendRPC('listDir',{path:'/Library/Audio'},function(r){
  console.log(r);
});


