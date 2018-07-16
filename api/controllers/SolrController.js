const request = require('request');

module.exports = {

  core: function(req,res) {
    const coreName = process.env.NLP_CORE_NAME || 'Core Not Initialized';
    return res.status(200).send({ coreName: coreName });
  },

  numDocs: function(req,res) {
    sails.helpers.getSolrNumDocs( process.env.NLP_CORE_NAME ).switch({
      error: function(err) {
        sails.log.error(err);
        return res.status(500).send( { error: 'Problem getting Solr Num Docs' } );
      },
      success: function(numDocs) {
        return res.status(200).send( { numDocs: numDocs } );
      }
    });
  }
}
