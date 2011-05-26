(function(){
var io=this.io;

/**
 * @var Client.registersRPC : stock all the method/callback of JSON-RPC
 */
io.Socket.prototype.registersRPC={};

/**
 * @var Client.callbacksRPC : stock all the callbacks which will be fired when a Return from client will appear
 */
io.Socket.prototype.callbacksRPC={};

/**
 * @var Client.uid : unique identifier by client, incremented by one at each JSON-RPC request
 */
io.Socket.prototype.uid=0;

/**
 * Used to give a uniq JSON-RPC request id (garanted uniq by Listener)
 */
io.Socket.prototype.uniqId=function(){
	return this.transport.sessionid+'#'+this.uid++;
};

/**
 * Send an JSON-RPC call to the client
 *
 * @param string Method to call on client
 * @param mixed Values or params to pass to the called method
 * @param function(result) Called when client has respond with result of the method in arguments
 *     OR object Contain settings which can be :
 *          {
 *            timeout int clientTimeout //After this duration, the callback is lost and will never be fired
 *            cleanCallbacksOnTimeout bool true //explicit, but can be set to false if we don't want to run timers, but be carefull
 *            success function(result) //Called when the client has respond, with result of the method in arguments
 *            error function(error) //Called when an error occur at client side, most of the time : {code:XXX, message:XXX}
 *          }
 */
io.Socket.prototype.callRPC=function(method, params, callback){
  var $ = this,
      options = {
        timeout: 8000,
        cleanCallbacksOnTimeout: true,
        success: null,
        error: null,
        params: {}    
      },
      id=$.uniqId();
  
  if(params && typeof params=='function')
    options.success=params;
  else if(params)
    options.params=params;
  if(callback && typeof callback=='function')
    options.success=callback;
  if(callback && typeof callback=='object')
    io.util.merge(options, callback);
    
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
 * @param function Callback to execute when the JSON-RPC is fired for this method
 */
io.Socket.prototype.listenRPC=function(method, callback){
  return this.registersRPC[method]=callback;
}

/**
 * When the transport receives new messages from the Socket.IO server it notifies us by calling
 * this method with the decoded `data` it received.
 *
 * @param data The message from the Socket.IO server.
 */
io.Socket.prototype.onMessage = function(data){
console.log(data);
  if(typeof data=='object' && data.method && this.registersRPC[data.method]){
    var res, id=data.id || null;
    try{
      res={result:this.registersRPC[data.method](data.params || null),id:id};
    }catch(e){
      res={error:{code:e.code,message:e.message},id:id};
    }
    
    data.id && this.send(res);
    
    this.emit('RPCCall', [data]);
    return;
  }
  
  if(typeof data=='object' && (data.result || data.error)){
    if(data.id && this.callbacksRPC[data.id]){
      this.callbacksRPC[data.id].timerOut && clearTimeout(this.callbacksRPC[data.id].timerOut);
      data.result && typeof this.callbacksRPC[data.id].success=='function'  && this.callbacksRPC[data.id].success(data.result);
      data.error && typeof this.callbacksRPC[data.id].error=='function' && this.callbacksRPC[data.id].error(data.error);
      delete this.callbacksRPC[data.id];
    }
    this.emit('RPCReturn', [data]);
    return;
  }

  //--Original method bellow--
  this.emit('message', [data]);
};
})();