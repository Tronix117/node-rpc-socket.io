var fs=require('fs'),
    controllers={},
    files=fs.readdirSync(__dirname);

files.forEach(function(file) {
  if(file.substr(-2)==='js')
    controllers.extend(require( './'+file));
});

module.exports=controllers;