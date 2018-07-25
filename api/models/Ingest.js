const moment = require('moment');

module.exports = {

  attributes: {

    createdAt: { type: 'string', autoCreatedAt: true },
    updatedAt: { type: 'string', autoUpdatedAt: true },

    status: {
      type: 'string',
      isIn: ['inProgress', 'completed', 'failed', 'deleted', 'queue']
    },

    type: {
      type: 'string',
      isIn: ['csv', 'database', 'api']
    },

    identifier: {
      type: 'string'
    },

    mappings: {
      type: 'json'
    },

    //soft delete
    isDeleted: {
      type: 'boolean',
      defaultsTo: false
    },

    friendlyTime: {
      type: 'string'
    }

    //TODO: user...

  },

  beforeCreate: function (recordToCreate, proceed) {
    recordToCreate['friendlyTime'] = moment(recordToCreate.createdAt).format('MMM Do, h:mm:ss a');
    return proceed();
  }

}
