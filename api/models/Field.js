module.exports = {

  attributes: {

    createdAt: { type: 'string', autoCreatedAt: true },
    updatedAt: { type: 'string', autoUpdatedAt: true },

    name: {
      type: 'string',
      required: true
    },

    field: { //solr field
      type: 'string',
      required: true,
      unique: true
    },

    suffix: {
      type: 'string',
      isIn: ['_attr', '_attrs', '_id']
    },

    type: {
      type: 'string',
      isIn: ['text', 'select'],
      required: true
    },

    inputTypeLocked: {
      type: 'boolean',
      defaultsTo: false,
    },

    requiredType: {
      type: 'string',
      required: true
    },

    validationMessage: {
      type: 'string',
      required: true
    },

    isCustom: {
      type: 'boolean',
      defaultsTo: true,
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
