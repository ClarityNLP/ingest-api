module.exports = {

  attributes: {

    createdAt: { type: 'string', autoCreatedAt: true },
    updatedAt: { type: 'string', autoUpdatedAt: true },

    field: { //solr field
      type: 'string'
    },

    name: {
      type: 'string'
    },

    type: {
      type: 'string',
      isIn: ['text', 'select']
    },

    validationMessage: {
      type: 'string'
    },

    requiredType: {
      type: 'string'
    }

    //TODO: user...

  }

}
