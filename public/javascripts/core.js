var socket = new io.Socket('127.0.0.1'); 

jQuery(function($j){
  var 
    scrollToBottom=function(){ //only send the scroll of the message box view to the end
      $j("#messageArea").scrollTop($("#messageArea")[0].scrollHeight);
    },
    printMessages=function(messageList){ //print messages to the message box according the messageList passed in arguments
      for(var i=0,l=messageList.length;i<l;i++){
        $j('#messageArea').append('<p><strong>'+messageList[i].pseudo+'</strong>: '+messageList[i].message+'</p>'); //I agreed it's not very clean to do it in this way, but it's the more non confusing and simple way for this tutorial project
      }
      scrollToBottom();
    },
    printError=function(e){ //print error messages in the message box, in case one occur, to trying it let's empty the pseudo or message input and then click send
      $j('#messageArea').append('<p class="error"><span class="error-symbol">X</span><strong>Error : </strong>'+e.message+'</p>');
      scrollToBottom();
    };

  $j('#sendAction').live('click',function(e){
    e.preventDefault();
    
    //CallRPC, here we call a RPC method named "addMessag" from the server, it will send a new message to the server in order to redistribute to all others clients
    socket.callRPC('addMessage', {message:$j('#sendMessage').val(),pseudo:$j('#pseudo').val()}, {
      success: function(){
        $j('#sendMessage').val(''); //when the success is called, clean textarea div
      }
      error: function(err){
        printError(err);
      }
    }); //don't need a successcallback, the server send an notifyRPC
  });

  //Used to detect the enter key in the textarea
  $('#sendMessage').live('keypress', function(e){
    if(e.keyCode==13)
      $j('#sendAction').click(); //simulate a click on the "send" button
  });

  
  //I prefer to connect the socket, once all js functions are load, maybe it would be better to start it in first time
  socket.connect();
  
  socket.registerRPC('newMessages',printMessages); //prepare for the broadcastNotifyRPC the server will send

  //When the socket connection is open, do...
  socket.on('connect', function(){
    //CallRPC, here we call a RPC method named "allMessage" from the server, it will get at the first print of the webpage all the already sent messages from all others clients
    socket.callRPC('allMessage',printMessages);
  });
});
