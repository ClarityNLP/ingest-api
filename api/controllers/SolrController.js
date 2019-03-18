const request = require('request');
const { NLP_CORE_NAME } = process.env;

module.exports = {
  core: function(req,res) {
    const coreName = NLP_CORE_NAME || 'Core Not Initialized';
    return res.status(200).send({ coreName: coreName });
  },

  numDocs: function(req,res) {
    sails.helpers.getSolrNumDocs(NLP_CORE_NAME).switch({
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
