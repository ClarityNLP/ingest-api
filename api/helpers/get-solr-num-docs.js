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

    request({
      method: 'GET',
      uri: `${process.env.NLP_SOLR_URL_TOP_LEVEL}/solr/${coreName}/query?debug=query&q=*:*`,
    },
    function (err, response, body) {
      if (err) {
        return exits.error(err);
      }
      const numDocs = JSON.parse(body).response.numFound;
      return exits.success(numDocs);
    });

  }
}
