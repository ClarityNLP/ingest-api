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

    req.file('csv').upload({
      maxBytes: 1000000000000,
      dirName: '/tmp'
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

      const fileStream = fs.createReadStream(uploadedFiles[0].fd, 'utf8');
      const csvStream = csv({
        headers: true, //ignore columns (row 1)
        ignoreEmpty: true
      });

      fileStream.pipe(csvStream);

      let count = 0;
      let chunk = [];
      const chunkSize = 5;

      var onData = function(row) {
        let payload = {};
        payload['id'] = uuidv4();
        //append generated id onto report_id
        mappings.map(obj => {
          if (obj.type === 'select') {
            payload[obj.key] = row[obj.sourceField] || 'Not Mapped'
          } else {
            payload[obj.key] = obj.value || 'No User Entry'
          }
          return;
        });
        payload['report_text'] = "testing";

        chunk.push(payload);
        count++;

        if (count == chunkSize) {
          count = 0;
          console.log(`sending chunk @ ${new Date()}`);
          request({
            url: `http://${process.env.NLP_SOLR_HOSTNAME}:${process.env.NLP_SOLR_CONTAINER_PORT}/solr/${process.env.NLP_CORE_NAME}/update/json?commit=true`,
            method: 'POST',
            body: chunk,
            json: true
          });
        }
      };
      csvStream.on('data', onData);
      csvStream.on('end', function(){
        //send the data that hasn't made the chunk limit
        //todo, possible dup scenario
        request({
          url: `http://${process.env.NLP_SOLR_HOSTNAME}:${process.env.NLP_SOLR_CONTAINER_PORT}/solr/${process.env.NLP_CORE_NAME}/update/json?commit=true`,
          method: 'POST',
          body: chunk,
          json: true
        });
        fs.unlinkSync(uploadedFiles[0].fd);
        return res.send(200, {});
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
