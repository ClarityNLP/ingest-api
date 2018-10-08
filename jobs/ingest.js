const resumable = require('../api/utilities/resumable-node.js')(`${process.env.RESUMABLE_DIR}/`);
const moment = require('moment');
const csv = require("fast-csv");
const request = require("request");
const crypto = require('crypto');

module.exports = function(agenda) {

  agenda.define('ingest csv', function(job, done) {

    const ingestId = job.attrs.data.ingestId;

    Ingest.findOne( { id: ingestId } ).exec(function(err, ingest) {
      if (err) {
        sails.log.error(err);
        done();
      }
      if (!ingest) {
        sails.log.info(`INGEST ${ingest.id} NOT FOUND. ENDING INGEST JOB`);
        done();
      }
      //update ingest status to *inProgress* and broadcast update to clients
      Ingest.update( { id: ingest.id }, { status: 'inProgress' } ).fetch().exec(function(err, updatedIngestRecord) {
        if (err) {
          sails.log.error(err);
          done();
        }
        sails.sockets.blast('ingestRecordStatusUpdate', updatedIngestRecord[0]);

        const mappings = ingest.mappings;
        const identifier = ingest.identifier;

        sails.log.info(`STARTING CSV INGEST -- ID ${ingestId} -- IDENTIFIER ${identifier}`);

        const csvStream = csv({
          headers: true, //ignore columns (row 1)
          ignoreEmpty: true
        });

        resumable.write(identifier, csvStream, {
          onDone: function() {
            sails.log.info(`FINISHED PIPING ${identifier} TO CSV STREAM.`);
          }
        });

        let count = 0;
        let chunk = [];
        const chunkSize = 500;

        var onValidate = function(row, next) {

          console.log("row: ",row);

          function getValue(row, solrField, mappings) {
            const type = mappings[solrField].type;
            let value;
            if (type === 'select') {
              value = row[mappings[solrField].sourceField];
            } else {
              value = mappings[solrField].value
            }
            return value;
          }

          let payload = Object.keys(mappings).reduce((result, solrField) => {
            result[solrField] = getValue(row, solrField, mappings);
            return result;
          }, {});

          console.log('payload: ',payload);

          //create unique hash using report_text as digest, set as solr id to avoid dups
          //TODO remove - solr SignatureUpdateProcessorFactory handling now
          // payload['id'] = crypto.createHash('md5')
          //   .update(row[mappings['report_text'].sourceField])
          //   .digest('hex')

          //add ingestId so documents added during this ingest job can be deleted from solr easily
          payload['ingest_id_attr'] = ingest.id;

          chunk.push(payload);
          count++;

          if (count == chunkSize) {
            count = 0;
            request({
              url: `http://${process.env.NLP_SOLR_HOSTNAME}:${process.env.NLP_SOLR_CONTAINER_PORT}/solr/${process.env.NLP_CORE_NAME}/update/json?update.chain=dedupe&commit=true`,
              method: 'POST',
              body: chunk,
              json: true
            }, function(err, response, body) {
              if (err) {
                sails.log.error(err);
                chunk = [];
                next(err);
              } else {
                sails.helpers.getSolrNumDocs( process.env.NLP_CORE_NAME ).switch({
                  error: function(err) {
                    sails.log.error(err);
                    chunk = [];
                    next(null,true);
                  },
                  success: function(numDocs) {
                    sails.sockets.blast('numDocsUpdate', { numDocs: numDocs });
                    chunk = [];
                    next(null,true);
                  }
                });
              }
            });
          } else {
            next(null,true)
          }
        }

        var onData = function(row) {
          return; //todo -- remove;
        };

        csvStream.validate(onValidate);

        csvStream.on('data', onData);

        csvStream.on('end', function(){
          request({
            url: `http://${process.env.NLP_SOLR_HOSTNAME}:${process.env.NLP_SOLR_CONTAINER_PORT}/solr/${process.env.NLP_CORE_NAME}/update/json?update.chain=dedupe&commit=true`,
            method: 'POST',
            body: chunk,
            json: true
          }, function(err, response, body) {
            sails.helpers.getSolrNumDocs( process.env.NLP_CORE_NAME ).switch({
              error: function(err) {
                sails.log.error(err);
                done();
              },
              success: function(numDocs) {
                sails.sockets.blast('numDocsUpdate', { numDocs: numDocs });
                //update ingest status to *completed* and broadcast update to clients
                Ingest.update( { id: ingest.id }, { status: 'completed' } ).fetch().exec(function(err, updatedIngestRecord) {
                  if (err) {
                    sails.log.error(err);
                    done();
                  }
                  sails.sockets.blast('ingestRecordStatusUpdate', updatedIngestRecord[0]);
                  done();
                });
              }
            });
          });
        });

        csvStream.on('error', function(err) {
          Ingest.update( { id: ingest.id }, { status: 'failed', errorStack: err } ).fetch().exec(function(err, updatedIngestRecord) {
            if (err) {
              sails.log.error(err);
              done();
            }
            sails.sockets.blast('ingestRecordStatusUpdate', updatedIngestRecord[0]);
            done();
          });
        });
      });
    });
  });
}
