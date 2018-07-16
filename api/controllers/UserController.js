module.exports = {

  me: function(req,res) {
    setTimeout(function(){
      return res.send(req.session);
    }, 700);
  }
}
