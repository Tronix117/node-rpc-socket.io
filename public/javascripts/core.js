var socket = new io.Socket('127.0.0.1'); 

jQuery(function($j){
  var 
    scrollToBottom=function(){
      $j("#messageArea").scrollTop($("#messageArea")[0].scrollHeight);
    },
    printMessages=function(messageList){
      for(var i=0,l=messageList.length;i<l;i++){
        $j('#messageArea').append('<p><strong>'+messageList[i].pseudo+'</strong>: '+messageList[i].message+'</p>');
      }
      scrollToBottom();
    },
    printError=function(e){
      $j('#messageArea').append('<p class="error"><span class="error-symbol">X</span><strong>Error : </strong>'+e.message+'</p>');
      scrollToBottom();
    };

  $j('#sendAction').live('click',function(e){
    e.preventDefault();
    socket.callRPC('addMessage', {message:$j('#sendMessage').val(),pseudo:$j('#pseudo').val()}, {
      error: function(e){
        printError(e);
      }
    }); //don't need a successcallback, the server send an notifyRPC
    $j('#sendMessage').val('');
  });

  $('#sendMessage').live('keypress', function(e){
    if(e.keyCode==13)
      $j('#sendAction').click();
  });

  
  socket.connect();

  socket.registerRPC('newMessages',printMessages); //prepare for the broadcastNotifyRPC the server will send

  socket.on('connect', function(){
    if($j('#sendAction').size()){ //if we are on the chat page then get message from server
      socket.callRPC('allMessage',printMessages);
    }
  });
});
