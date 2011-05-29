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
        finaly: null,
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
  if(options.success || options.error || options.finaly){
    if(options.cleanCallbacksOnTimeout){
      r.timerOut=setTimeout(function(){
        $.onMessage({error:{code:'CALLRPCTIMEOUT',message:'Server has not respond in time'},id:id});
        delete $.callbacksRPC[id];
      },options.timeout);
    }
    options.success && (r.success=options.success);
    options.error && (r.error=options.error);
    options.finaly && (r.finaly=options.finaly);
  }
  r!={} && ($.callbacksRPC[id]=r);
	return $.send({method:method,params:options.params,id:id});
};

/**
 * Register a new function to be called by JSON-RPC
 *
 * Run each function, next() run the following, stop when a callback function return is reach
 *
 * @param string Name of the JSON-RPC method
 * @param function(data, client, next) Callback to execute when the JSON-RPC is fired for this method
 *     OR array<function(data, client, next)>
 * @param optional function(data, client, next) Callback to execute when the JSON-RPC is fired for this method
 * @param ...
 */
io.Socket.prototype.listenRPC=function(method, callback){
  var callbacks=[];
  for(var j=1;j<arguments.length;j++){
    if(Array.isArray(arguments[j]))
      for(var i=0;i<arguments[j].length;i++){
        typeof arguments[j][i] === 'function' && callbacks.push(arguments[j][i]);
      }
    else if(typeof arguments[j] === 'function')
      callbacks.push(arguments[j]);
  }
  if(callbacks.length>0)
    this.registersRPC[method]=callbacks;
  return this;
}

io.Socket.prototype.runRegistersCallbackRPC=function(method, params, callbacks){
  var ret=null;
  var $$=this;
  if(callbacks.length>0)
    var c=callbacks.shift();
    ret=c(params || null, function(){
      if(callbacks.length>0)
        ret=$$.runRegistersCallbackRPC(method, params, callbacks);
    });
  return ret;
}

io.Socket.prototype._onClientReturnRPC= function(data){
  var res, id=data.id || null;
  try{
    res={
      result:this.runRegistersCallbackRPC(
        data.method, 
        data.params || null, 
        this.registersRPC[data.method].slice(0)
      ),
      id:id
    };
  }catch(e){
    res={error:{code:e.code,message:e.message},id:id};
  }
  data.id && this.send(res);
  
  this.emit('RPCCall', data);
  return;
};

io.Socket.prototype._onClientCallRPC= function(data){
  if(data.id && this.callbacksRPC[data.id]){
    this.callbacksRPC[data.id].timerOut && clearTimeout(this.callbacksRPC[data.id].timerOut);
    data.result && typeof this.callbacksRPC[data.id].success=='function'  && this.callbacksRPC[data.id].success(data.result);
    data.error && typeof this.callbacksRPC[data.id].error=='function' && this.callbacksRPC[data.id].error(data.error);
    typeof this.callbacksRPC[data.id].finaly=='function' && this.callbacksRPC[data.id].finaly(data);
    
    delete this.callbacksRPC[data.id];
  }
  this.emit('RPCReturn', data);
  return;
};

/**
 * Overloading of onMessage to catch RPC call or RPC responses
 */
io.Socket.prototype.onMessage = function(data){
  if(typeof data=='object' && data.method && this.registersRPC[data.method])
    return this._onClientReturnRPC(data);
  
  if(typeof data=='object' && (data.result || data.error))
    return this._onClientCallRPC(data);
  
  //--Original method bellow--
  this.emit('message', [data]);
};
})();