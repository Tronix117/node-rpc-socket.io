var socket = new io.Socket('127.0.0.1'); 

jQuery(function($j){
socket.connect();
socket.on('connect', function(){
  if($j('#sendAction').size()>0){
    socket.callRPC('allMessage',{},function(r){
      for(var i=0,l=r.length;i<l;i++){
        printMessage(r[i]);
      }
    });
  }
});
socket.on('message', function(message){
  
});
socket.on('disconnect', function(){console.log('Disconnected');});

  var printMessage=function(m){
    $j('#messageArea').append('<p><strong>'+m.pseudo+'</strong>: '+m.message+'</p>');
    $j("#messageArea").scrollTop($("#messageArea")[0].scrollHeight);
  };

  $j('#sendAction').live('click',function(e){
    e.preventDefault();
    socket.callRPC('addMessage',{message:$j('#sendMessage').val(),pseudo:$j('#pseudo').val()},function(r){
      printMessage(r);
    });
    $j('#sendMessage').val('');
  });

  $('#sendMessage').bind('keypress', function(e) {
    if(e.keyCode==13){
      $j('#sendAction').click();
    }
  });

});
