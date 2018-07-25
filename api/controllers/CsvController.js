const csv = require("fast-csv");
const path = require("path");
const fs = require('fs');
const request = require('request');
const uuidv4 = require('uuid/v4');

module.exports = {

  scheduleIngestJob: function(req,res) {
    const ingestId = req.param('ingestId');
    sails.helpers.scheduleJob( 'ingest csv', 'now', { ingestId } ).switch({
      error: function(err) {
        sails.log.error(err);
        return res.status(500).send( { msg: `Problem scheduling *ingest csv* job for IngestId ${ingestId}` } );
      },
      success: function() {
        return res.status(200).send( { msg: `Scheduled *ingest csv* job for IngestId ${ingestId}`} );
      }
    })
  },

  createIngest: function(req,res) {

    let fileIdentifier;
    let mappings;

    try {
      fileIdentifier = req.body.file.value.uniqueIdentifier;
      mappings = req.body.mappings;
    }
    catch(err) {
      return res.status(400).send( { 'message': 'Invalid input params' } );
    }

    Ingest.create( { identifier: fileIdentifier, mappings: mappings, status: 'queue', type: 'csv' } ).fetch().exec(function(err, ingest) {
      if (err) {
        sails.log.error(err);
        return res.status(500).send({});
      }
      return res.send(200, { id: ingest.id });
    });
  }
}
