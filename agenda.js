var Agenda = require('agenda');

var agenda = new Agenda({db: { address: `mongodb://admin:password@${process.env.INGEST_MONGO_HOSTNAME}:${process.env.INGEST_MONGO_CONTAINER_PORT}/${process.env.INGEST_MONGO_DATABASE}` }});

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
