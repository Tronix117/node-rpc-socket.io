var io=require('socket.io'),
    Client=require('socket.io/lib/socket.io/client.js');

/**
 * @var Client.registersRPC : stock all the method/callback of JSON-RPC
 */
Client.prototype.registersRPC={};

/**
 * @var Client.callbacksRPC : stock all the callbacks which will be fired when a Return from client will appear
 */
Client.prototype.callbacksRPC={};

/**
 * @var Client.uid : unique identifier by client, incremented by one at each JSON-RPC request
 */
Client.prototype.uid=0;

/**
 * Used to give a uniq JSON-RPC request id (garanted uniq by Listener)
 */
Client.prototype.uniqId=function(){
	return this.sessionId+'$'+this.uid++;
};

/**
 * Send an JSON-RPC call to the client
 *
 * @param string Method to call on client
 * @param mixed Values or params to pass to the called method
 *     OR function(result) Called when client has respond with result of the method in arguments
 * @param function(result) Called when client has respond with result of the method in arguments
 *     OR object Contain settings which can be :
 *          {
 *            timeout int clientTimeout //After this duration, the callback is lost and will never be fired
 *            cleanCallbacksOnTimeout bool true //explicit, but can be set to false if we don't want to run timers, but be carefull
 *            success function(result, client) //Called when the client has respond, with result of the method in arguments
 *            error function(error, client) //Called when an error occur at client side, most of the time : {code:XXX, message:XXX}
 *          }
 */
Client.prototype.callRPC=function(method, params, callback){
  var $ = this,
      options = {
        timeout: $.options.timeout,
        cleanCallbacksOnTimeout: true,
        success: null,
        error: null     
      },
      id=$.uniqId();
  
  if(params && typeof params=='function')
    options.success=params;
  else if(params)
    options.params=params;
  if(callback && typeof callback=='function')
    options.success=callback;
  if(callback && typeof callback=='object')
    options=merge(options, callback);
  
  var r={};
  if(options.success || options.error){
    if(options.cleanCallbacksOnTimeout){
      r.timerOut=setTimeout(function(){
        delete $.callbacksRPC[id];
      },options.timeout);
    }
    options.success && (r.success=options.success);
    options.error && (r.error=options.error);
  }
  r!={} && ($.callbacksRPC[id]=r);
  
	return $.send({method:method,params:options.params,id:id});
};

/**
 * Register a new function to be called by JSON-RPC
 *
 * @param string Name of the JSON-RPC method
 * @param function(data, client) Callback to execute when the JSON-RPC is fired for this method
 */
Client.prototype.registerRPC=function(method, callback){
  this.registersRPC[method]=callback;
  return this;
}

Client.prototype.broadcastNotifyRPC = function(message){
  if (!('sessionId' in this)) return this;
  this.listener.broadcastNotifyRPC(method, params, this.sessionId);
  return this;
};

/**
 * Overloading of _onClientMessage to catch RPC call or RPC responses
 */
io.Listener.prototype._onClientMessage = function(data, client){
  if(typeof data=='object' && data.method && client.registersRPC[data.method]){
    var res, id=data.id || null;
    try{
      res={result:client.registersRPC[data.method](data.params || null,client),id:id};
    }catch(e){
      res={error:{code:e.code,message:e.message},id:id};
    }
    data.id && client.send(res);
    
    client.emit('RPCCall', data);
    this.emit('clientRPCCall', data, client);
    return;
  }
  
  if(typeof data=='object' && (data.result || data.error)){
    if(data.id && client.callbacksRPC[data.id]){
      client.callbacksRPC[data.id].timerOut && clearTimeout(this.callbacksRPC[id].timerOut);
      data.result && typeof client.callbacksRPC[data.id].success=='function'  && client.callbacksRPC[data.id].success(data.result,client);
      data.error && typeof client.callbacksRPC[data.id].error=='function' && client.callbacksRPC[data.id].error(data.error,client);
      delete client.callbacksRPC[data.id];
    }
    client.emit('RPCReturn', data);
    this.emit('clientRPCReturn', data, client);
    return;
  }
  
  //original Listener._onClientMessage
  this.emit('clientMessage', data, client);
};

/**
 * Send an JSON-RPC call to the all client (except specificated ones)
 *
 * @param string Method to call on client
 * @param mixed Values or params to pass to the called method
 * @param function(result) Called when client has respond with result of the method in arguments
 *     OR object Contain settings which can be :
 *          {
 *            timeout int clientTimeout //After this duration, the callback is lost and will never be fired
 *            cleanCallbacksOnTimeout bool true //explicit, but can be set to false if we don't want to run timers, but be carefull
 *            success function(result, client) //Called when the client has respond, with result of the method in arguments
 *            error function(error, client) //Called when an error occur at client side, most of the time : {code:XXX, message:XXX}
 *          }
 * @param number | string | array Used to determine to who doesn't send the callRPC
 */
io.Listener.prototype.broadcastCallRPC=function(method, params, callback, except){
  for (var i = 0, k = Object.keys(this.clients), l = k.length; i < l; i++){
    if (!except || ((typeof except == 'number' || typeof except == 'string') && k[i] != except)
                || (Array.isArray(except) && except.indexOf(k[i]) == -1)){
      this.clients[k[i]].callRPC(method, params, function(result){
        callback(result, this.clients[k[i]]);
      });
    }
  }
  return this;
}

io.Listener.prototype.broadcastNotifyRPC=function(method, params, except){
  for (var i = 0, k = Object.keys(this.clients), l = k.length; i < l; i++){
    if (!except || ((typeof except == 'number' || typeof except == 'string') && k[i] != except)
                || (Array.isArray(except) && except.indexOf(k[i]) == -1)){
      this.clients[k[i]].callRPC(method, params);
    }
  }
  return this;
}

module.exports=io;