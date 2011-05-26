//File which load all the controllers
var fs=require('fs'),
    controllers={},
    files=fs.readdirSync(__dirname);

files.forEach(function(file) {
  if(file.substr(-2)==='js' && typeof (c=require( './'+file))==='object')
    controllers.extend(c);
});

module.exports=controllers;