var resumable = require('../utilities/resumable-node.js')(`${process.env.RESUMABLE_DIR}/`);
var crypto = require('crypto');
var agenda = require('../../agenda.js');

module.exports = {

  upload: function(req,res) {
    const mappings = req.param('mappings');
    resumable.post(req, function(status, filename, original_filename, identifier){
        sails.log.info('POST', status, original_filename, identifier);
        return res.send(status);
    });
  },

  chunkStatusCheck: function(req,res) {
    resumable.get(req, function(status, filename, original_filename, identifier){
        sails.log.info('GET', status);
        return res.send((status == 'found' ? 200 : 404), status);
    });
  },

  fileId: function(req,res) {
    const filename = req.param('filename');
    if(!filename){
      return res.status(500).send('query parameter missing');
    }
    // create md5 hash from filename
    return res.status(200).send(
      crypto.createHash('md5')
      .update(filename)
      .digest('hex')
    );
  },

  download: function(req,res) {
    resumable.write(req.param('identifier'), res);
  }
}
