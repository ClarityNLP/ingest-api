const csv = require("fast-csv");
const path = require("path");
const fs = require('fs');
const request = require('request');
const uuidv4 = require('uuid/v4');

module.exports = {

  pair: function(req,res) {
    const sourceKey = req.param('sourceKey');
    const destKey = req.param('destKey');

    req.session.destination[destKey].sourceField = sourceKey;
    req.session.source[sourceKey].destinationField = destKey;

    return res.send(200, { sourceKey: sourceKey, destKey: destKey });
  },

  ingest: function(req,res) {

    const mappings = JSON.parse(req.param('mappings'));
    const fileSize =  req.param('fileSize')
    let progressCount = 0
    const progressSize = 1000;

    sails.sockets.blast('csvIngestUpdate', { status: 'Uploading file' });

    req.file('csv').upload({
      maxBytes: 1000000000000,
      dirName: '/tmp',
      onProgress: function(progress) {
        if (progressCount === progressSize) {
          const percent = Math.round((progress.written/fileSize)*100);
          sails.log.info(`Upload progress is ${percent} @ ${new Date()}`);
          sails.sockets.blast('csvIngestUpdate', { status: `Uploading file (${percent}%)` });
          progressCount = 0;
          return;
        } else {
          progressCount++
          return;
        }
      }
    }, function(err, uploadedFiles) {
      if (err) {
        sails.log.error(err);
        return res.send(500, { message: 'Problem uploading file.' } );
      }

      if (uploadedFiles.length === 0) {
        return res.send(400, { message: 'No file sent.' } );
      }

      if (uploadedFiles[0].type !== 'text/csv') {
        return res.send(400, { message: 'File must be csv format. ' } );
      }

      sails.sockets.blast('csvIngestUpdate', { status: 'Done uploading file. Creating read stream.' });

      const fileStream = fs.createReadStream(uploadedFiles[0].fd, 'utf8');
      const csvStream = csv({
        headers: true, //ignore columns (row 1)
        ignoreEmpty: true
      });

      sails.sockets.blast('csvIngestUpdate', { status: 'Writing to Solr instance.' });

      fileStream.pipe(csvStream);

      let count = 0;
      let chunk = [];
      const chunkSize = 500;

      var onValidate = function(row, next) {
        let payload = {};
        // payload['id'] = uuidv4(); //TODO
        //append generated id onto report_id
        mappings.map(obj => {
          if (obj.type === 'select') {
            payload[obj.key] = row[obj.sourceField] || 'Not Mapped'
          } else {
            payload[obj.key] = obj.value || 'No User Entry'
          }
          return;
        });

        chunk.push(payload);
        count++;

        if (count == chunkSize) {
          count = 0;
          request({
            url: `http://${process.env.NLP_SOLR_HOSTNAME}:${process.env.NLP_SOLR_CONTAINER_PORT}/solr/${process.env.NLP_CORE_NAME}/update/json?commit=true`,
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
          url: `http://${process.env.NLP_SOLR_HOSTNAME}:${process.env.NLP_SOLR_CONTAINER_PORT}/solr/${process.env.NLP_CORE_NAME}/update/json?commit=true`,
          method: 'POST',
          body: chunk,
          json: true
        }, function(err, response, body) {
          sails.helpers.getSolrNumDocs( process.env.NLP_CORE_NAME ).switch({
            error: function(err) {
              sails.log.error(err);
              fs.unlinkSync(uploadedFiles[0].fd);
              return res.send(500, { message: "Something went wrong." });
            },
            success: function(numDocs) {
              sails.sockets.blast('numDocsUpdate', { numDocs: numDocs });
              fs.unlinkSync(uploadedFiles[0].fd);
              return res.send(200, {});
            }
          });
        });
      });
    });
  },

  initial: function(req,res) {
    const initialDestination = {
      source: {
        sourceField: null,
        name: 'Document Source',
        type: 'text',
        value: null,
        required: true
      },
      subject: {
        sourceField: null,
        name: 'Patient Id',
        type: 'select',
        required: true
      },
      report_date: {
        sourceField: null,
        name: 'Report Date',
        type: 'select',
        required: true
      },
      report_id: {
        sourceField: null,
        name: 'Report Id',
        type: 'select',
        required: true
      },
      report_type: {
        sourceField: null,
        name: 'Report Type',
        type: 'select',
        required: true
      },
      report_text: {
        sourceField: null,
        name: 'Report Text',
        type: 'select',
        required: true
      }
    };
    return res.send(200, initialDestination);
  }
}
