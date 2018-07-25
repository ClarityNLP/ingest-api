const seed = require('../seed.js');

module.exports.bootstrap = function(done) {

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
