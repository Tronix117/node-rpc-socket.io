exports.Chat = new function(){
  var $=this;
  
  $.buffer=[];
    
  $.get_index=function(req, res, next){
    res.render('chat', {
      title: 'Chat'
    });
  };
  
  $.rpc_INIT=function(client){
    $.client=client;
    client.registerRPC('allMessage',$.rpc_allMessage)
          .registerRPC('addMessage',$.rpc_addMessage);
  };
  
  $.rpc_allMessage=function(params){
    return $.buffer;
  };
  
  $.rpc_addMessage=function(params,client){
    $.buffer.push(params);
    client.listener.broadcastNotifyRPC('newMessages',[params]);
  };
}();