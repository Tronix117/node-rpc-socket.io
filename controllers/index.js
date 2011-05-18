exports.Index = {
  index:function(req, res, next){
    res.render('index', {
      title: 'Express'
    });
  }
}
