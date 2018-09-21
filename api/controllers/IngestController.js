const request = require('request');

module.exports = {

  getPageOfIngestRecords: function(req,res) {
    const page = req.param('page') ? Number(req.param('page')) : 0;
    Ingest.find( { where: { status: { '!=': 'queue' } }, limit: 5, skip: page*5, sort: 'createdAt DESC' } ).exec(function(err, paginatedIngestRecords){
      if (err) {
        sails.log.error(err);
        return res.status(500).send({});
      }
      //check if the next page has records (in order to know if we should hide/show next page button in UI)
      Ingest.find( { where: { status: { '!=': 'queue' } }, limit: 5, skip: ((page+1)*5), sort: 'createdAt DESC' } ).exec(function(err, nextPageRecords) {
        if (err) {
          sails.log.error(err);
          return res.status(500).send({});
        };
        const isNextDisabled = nextPageRecords.length == 0;
        return res.status(200).send( { records: paginatedIngestRecords, isNextDisabled: isNextDisabled, page: page } );
      });
    });
  },

  deleteRecordandDocsFromSolr: function(req,res) {

    const ingestId = req.param('ingestId');

    Ingest.findOne( { id: ingestId } ).exec(function(err, ingest) {
      if (err) {
        sails.log.error(err);
        return res.status(500).send({});
      }
      if (!ingest) {
        return res.status(400).send({});
      }
      Ingest.update( { id: ingestId }, { status: 'deleted', isDeleted: true } ).fetch().exec(function(err, updatedIngestRecord) {
        if (err) {
          sails.log.error(err);
          return res.status(500).send({});
        }
        //delete documents tagged with *ingestId* from solr
        request({
          url: `http://${process.env.NLP_SOLR_HOSTNAME}:${process.env.NLP_SOLR_CONTAINER_PORT}/solr/${process.env.NLP_CORE_NAME}/update/json?commit=true`,
          method: 'POST',
          body: {
              "delete": {
                  "query": `ingest_id_attr:${ingestId}`
              }
          },
          json: true
        }, function(err, response, body) {
          if (err) {
            sails.log.error(err);
            return res.status(500).send({});
          } else {
            sails.helpers.getSolrNumDocs( process.env.NLP_CORE_NAME ).switch({
              error: function(err) {
                sails.log.error(err);
                return res.status(500).send({});
              },
              success: function(numDocs) {
                sails.sockets.blast('numDocsUpdate', { numDocs: numDocs });
                //TODO broadcast remove ingest record from ui table...
                return res.status(200).send(updatedIngestRecord[0]);
              }
            });
          }
        });
      });
    });
  }
}
