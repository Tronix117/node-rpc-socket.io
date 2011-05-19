exports.Chat = new function(){
  var $=this;
  $.buffer=[];
  $.client=null;
    
  $.index=function(req, res, next){
    res.render('chat', {
      title: 'Chat'
    });
  };
  
  $.rpc_init=function(client){
    $.client=client;
    client.registerRPC('allMessage',$.rpc_allMessage)
          .registerRPC('addMessage',$.rpc_addMessage);
  };
  
  $.rpc_allMessage=function(params){
    return $.buffer;
  };
  
  $.rpc_addMessage=function(params){
    $.buffer.push(params);
    $.client.broadcast({result:params});
    return params;
  };
}();