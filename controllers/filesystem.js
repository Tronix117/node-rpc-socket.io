var fs=require('fs');
exports.Filesystem = {
  listDir:function(req, res, next){
    res.render('list', {
      title: 'Liste',
      items: fs.readdirSync(req.param(0))
    });
  }
};
