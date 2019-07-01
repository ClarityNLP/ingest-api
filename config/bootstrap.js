const seed = require('../seed.js');
const axios = require('axios');
const {
  NLP_API_HOSTNAME,
  NLP_API_CONTAINER_PORT,
  NLP_SOLR_HOSTNAME,
  NLP_SOLR_CONTAINER_PORT,
  INTERVAL
} = process.env;

module.exports.bootstrap = function(done) {

  getJobs = () => {
    const url = `http://${NLP_API_HOSTNAME}:${NLP_API_CONTAINER_PORT}/phenotype_jobs/ALL`;

    return axios
      .get(url)
      .then(response => {
        return {
          jobs: JSON.stringify(response.data)
        };
      })
      .catch(err => {
        return { jobs: JSON.stringify({ error: err.message }) };
      });
  };

  getJobStats = IDs => {
    const url = `http://${NLP_API_HOSTNAME}:${NLP_API_CONTAINER_PORT}/stats/${IDs}`;

    return axios
      .get(url)
      .then(response => {
        return { stats: JSON.stringify(response.data) };
      })
      .catch(err => {
        return { stats: JSON.stringify({ error: err.message }) };
      });
  };

  getJobPerformance = IDs => {
    const url = `http://${NLP_API_HOSTNAME}:${NLP_API_CONTAINER_PORT}/performance/${IDs}`;

    return axios
      .get(url)
      .then(response => {
        return { performance: JSON.stringify(response.data) };
      })
      .catch(err => {
        return { performance: JSON.stringify({ error: err.message }) };
      });
  };

  getLibrary = () => {
    const url = `http://${NLP_API_HOSTNAME}:${NLP_API_CONTAINER_PORT}/library`;

    return axios
      .get(url)
      .then(response => {
        return { library: JSON.stringify(response.data) };
      })
      .catch(err => {
        return { library: JSON.stringify({ error: err.message }) };
      });
  };

  getDocuments = () => {
    const url =
      `http://${NLP_SOLR_HOSTNAME}:${NLP_SOLR_CONTAINER_PORT}/solr/sample` +
      '/select?facet.field=source&facet=on&fl=facet_counts&indent=on&q=*:*&rows=1&wt=json';

    return axios
      .get(url)
      .then(response => {
        return {
          documents: JSON.stringify(
            response.data.facet_counts.facet_fields.source
          )
        };
      })
      .catch(err => {
        return { documents: JSON.stringify({ error: err.message }) };
      });
  };

  const broadcast = () => {
    const jobCall = getJobs();
    const libraryCall = getLibrary();
    const docsCall = getDocuments();

    Promise.all([jobCall, libraryCall, docsCall])
      .then(responses => {
        const data = {};

        for (let i = 0; i < responses.length; i++) {
          let obj = responses[i];
          let entries = Object.entries(obj)[0];
          let key = entries[0];
          let value = entries[1];

          data[key] = value;
        }

        const jobs = JSON.parse(data.jobs);

        if (jobs.length > 0) {
          const IDs = jobs.map(job => {
            return job.nlp_job_id;
          });

          const statsCall = getJobStats(IDs);
          const performanceCall = getJobPerformance(IDs);

          return Promise.all([statsCall, performanceCall]).then(responses => {
            for (let i = 0; i < responses.length; i++) {
              let obj = responses[i];
              let entries = Object.entries(obj)[0];
              let key = entries[0];
              let value = entries[1];

              data[key] = value;
            }
            sails.sockets.blast('stats', JSON.stringify(data));
          });
        } else {
          data.stats = JSON.stringify({});
          data.performance = JSON.stringify({});
          sails.sockets.blast('stats', JSON.stringify(data));
        }
      })
      .catch(err => {
        sails.log.error(err);
        sails.sockets.blast('stats', JSON.stringify(err));
      });
  };

  // const brodcastInterval = setInterval(broadcast, INTERVAL);

  // Check to see if we have already seeded the Field collection w/ default data
  Field.count().exec(function(err, fieldCount) {
    if (err) {
      sails.log.error(err);
      return done();
    }
    if (fieldCount > 0) {
      return done();
    }
    //Seed the field collection
    Field.createEach(seed.field()).exec(function(err) {
      if (err) {
        sails.log.error(err);
        return done();
      }
      return done();
    });
  });
};
