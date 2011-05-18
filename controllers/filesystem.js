var fs=require('fs');
//var rpc=require('./rpc');

exports.Filesystem = new function(){
  var $=this;
  
  $.listDir= function(dirPath){
    try{
      return fs.readdirSync(dirPath);
    }
    catch(e){
      return {error:e};
    }
  };
  
  $.sock_listDir=function(client, params, id){
    if(!params.path) return client.send({error:{code:'MISSINGPARAM',message:'MISSINGPARAM, param `path` must be specified'},id:id});
  
    var l=$.listDir(params.path);
    if(l.error) return client.send({error:{code:l.error.code,message:l.error.message},id:id});
    return client.send({result:l,id:id});
  };
  
  $.get_listDir=function(req, res, next){
    res.render('list', {
      title: 'Liste',
      items: $.listDir(req.param(0))
    });
  };
}();
