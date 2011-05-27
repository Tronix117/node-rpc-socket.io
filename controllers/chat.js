exports.Chat = new function(){
  //Define $ as "this" ($=S=self), indeed "this" is take time to calculate which object we are talking about whereas a variable is only a pointer to the object. In an other hand $ is far more sexy and visible :)
  //I also use $$ sometimes for functions or object inside an object, to differenciate the inside object instance (then $$$, then ...)
  var $=this;
  
  //Buffer of messages, global to all clients
  $.buffer=[];
  
  //Only used by routing, take a look at the "get_" beginning, it's to differenciate rpc callback from get or post, or others methods
  $.get_index=function(req, res, next){
    //only render the chat.jade view inside the layout.jade default layout
    res.render('chat', {
      title: 'Chat'
    });
  };
  
  //Called by the app.js to initiate all our client instance of RPC socket use at the client connection
  $.rpc_INIT=function(client){
    //Here we prepare all methods for the client which will listen for a RPC call from this particular client
    client.listenRPC('allMessage',$.rpc_allMessage)
          .listenRPC('addMessage',$.rpc_validate_message,$.rpc_addMessage); //Here we pass two callback methods, the first one is a veryfing method, which have to call "next()" to pass throw the second method
  };
  
  //Used to validate the entry format, just an example, no specific validations
  $.rpc_validate_message=function(params,client,next){
    if(!params.pseudo || !params.message)
      throw {code:'WRONGTYPE',message:'Bad parameters'}; //return an RPC error format to the client, which can be interpret at the client part by the "error" callback of the callRPC client method
    next(); //if all's right, then we can pass to the next method which is in this particulare case $.rpc_addMessage
  }
  
  $.rpc_addMessage=function(params,client){
    $.buffer.push(params); //push the message sent by the client, and all associated informations to the buffer
    client.listener.broadcastNotifyRPC('newMessages',[params]); //paid attention here : we want to send this new message to all other connected client, if you call directly client.broadcastNotifyRPC, it will send the call to all client except this one, instead we can use the client.listener.broadcastNotifyRPC to notify all client even this one. client.listener.broadcastNotifyRPC also have an except parameter which can be set
    return true; //if this function doesn't return something, the client "success" callback will never be called, but we need it to empty the textarea field, look at the core.js file, in the client part : public/javascript/core.js
  };
  
  //just send all the buffer when a client request it
  $.rpc_allMessage=function(params){
    return $.buffer;
  };
}();