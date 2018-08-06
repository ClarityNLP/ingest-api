module.exports = {

  attributes: {

    createdAt: { type: 'string', autoCreatedAt: true },
    updatedAt: { type: 'string', autoUpdatedAt: true },

    name: {
      type: 'string'
    },

    field: { //solr field
      type: 'string'
    },

    suffix: {
      type: 'string',
      isIn: ['_attr', '_attrs', '_id']
    },

    type: {
      type: 'string',
      isIn: ['text', 'select']
    },

    inputTypeLocked: {
      type: 'boolean',
      defaultsTo: false
    },

    requiredType: {
      type: 'string'
    },

    validationMessage: {
      type: 'string'
    },

    isCustom: {
      type: 'boolean',
      defaultsTo: true
    },

    fieldWithSuffix: {
      type: 'string'
    }

    //TODO: user...
  },

  beforeCreate: function (recordToCreate, proceed) {
    recordToCreate['fieldWithSuffix'] = recordToCreate.isCustom ? `${recordToCreate.field}${recordToCreate.suffix}` : recordToCreate.field;
    return proceed();
  }

}
