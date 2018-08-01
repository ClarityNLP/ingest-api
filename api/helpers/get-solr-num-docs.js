const request = require('request');

module.exports = {

  friendlyName: 'Get Solr Document Number',
  description: 'Get the current number of documents from solr for a given core.',

  inputs: {
    coreName: {
      type: 'string',
      description: 'The core name',
      required: true
    }
  },

  fn: function(inputs, exits) {

    const coreName = inputs.coreName
    sails.log.verbose(`Fetching SOLR docs from *${coreName}* core @ ${process.env.NLP_SOLR_URL_TOP_LEVEL}`);

    request({
      method: 'GET',
      uri: `${process.env.NLP_SOLR_URL_TOP_LEVEL}/solr/${coreName}/query?debug=query&q=*:*`,
    },
    function (err, response, body) {
      if (err) {
        return exits.error(err);
      }
      if (response.statusCode === 404) {
        return exits.error(`Error fetching number of Solr documents. Make sure you created the *${process.env.NLP_CORE_NAME}* core.`);
      }
      const numDocs = JSON.parse(body).response.numFound;
      sails.log.verbose(`Num Docs on *${coreName}* core: ${numDocs}`);
      return exits.success(numDocs);
    });

  }
}
