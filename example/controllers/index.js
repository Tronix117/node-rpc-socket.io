/**
 * File which load all the controllers
 * Once time again, don't pay a big attention at that, it was just a 5mins coding
 */

var fs=require('fs'),
    controllers={},
    files=fs.readdirSync(__dirname);

files.forEach(function(file) {
  if(file.substr(-2)==='js' && typeof (c=require( './'+file))==='object')
    controllers.extend(c);
});

module.exports=controllers;