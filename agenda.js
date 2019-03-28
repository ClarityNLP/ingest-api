var Agenda = require('agenda');

const {
  INGEST_MONGO_USERNAME,
  INGEST_MONGO_PASSWORD,
  INGEST_MONGO_HOSTNAME,
  INGEST_MONGO_CONTAINER_PORT,
  INGEST_MONGO_DATABASE
} = process.env;

var agenda = new Agenda({db: { address: `mongodb://${INGEST_MONGO_USERNAME}:${INGEST_MONGO_PASSWORD}@${INGEST_MONGO_HOSTNAME}:${INGEST_MONGO_CONTAINER_PORT}/${INGEST_MONGO_DATABASE}` }});

var jobTypes = process.env.JOB_TYPES ? process.env.JOB_TYPES.split(',') : [];

jobTypes.forEach(function(type) {
  require('./jobs/' + type)(agenda);
})

if(jobTypes.length) {
  agenda.processEvery('two seconds').on('ready', function() {
    agenda.start();
  });
}

module.exports = agenda;
