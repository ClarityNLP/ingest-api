module.exports = {

  getFields: function(req,res) {
    Field.find().exec(function(err, fields) {
      if (err) {
        sails.log.error(err);
        return res.status(500).send({});
      }
      const massagedFields = fields.reduce((result, field) => {
        result[field.fieldWithSuffix] = {
          name: field.name,
          type: field.type,
          validationMessage: field.validationMessage,
          requiredType: field.requiredType,
          sourceField: null,
          value: null,
          isCustom: field.isCustom ? true : false,
          inputTypeLocked: field.inputTypeLocked,
          suffix: field.suffix
        }
        return result;
      }, {});
      return res.status(200).send(massagedFields);
    });
  },

  createCustomField: function(req,res) {

    const params = {
      name: req.param('friendlyName'),
      field: req.param('keyName'),
      suffix: req.param('suffix'),
      type: req.param('inputType'),
      inputTypeLocked: req.param('lockInput') == 'yes' ? true : false,
      requiredType: req.param('requiredType'),
      validationMessage: req.param('validationMessage'),
    }

    Field.create(params).fetch().exec(function(err, field) {
      if (err) {
        sails.log.error(err);
        return res.status(500).send('Problem creating custom field');
      }
      const massagedFields = [field].reduce((result, field) => {
        result[field.fieldWithSuffix] = {
          name: field.name,
          type: field.type,
          validationMessage: field.validationMessage,
          requiredType: field.requiredType,
          sourceField: null,
          value: null,
          isCustom: field.isCustom ? true : false,
          inputTypeLocked: field.inputTypeLocked,
          suffix: field.suffix
        }
        return result;
      }, {});
      return res.status(200).send(massagedFields);
    });
  },

  deleteField: function(req,res) {

    const field = req.param('field');

    Field.findOne( { fieldWithSuffix: field } ).exec(function(err, foundField) {
      if (err) {
        sails.log.error(err);
        return res.status(500).send(`Problem finding field *${field}*`);
      }
      if (!foundField) {
        return res.status(200).send(`Field *${field}* already deleted`);
      }
      if (!foundField.isCustom) {
        return res.status(400).send(`Field *${field}* cannot be deleted. Not a custom field`);
      }
      Field.destroy( { fieldWithSuffix: field } ).exec(function(err) {
        if (err) {
          sails.log.error(err);
          return res.status(500).send(`Problem deleteing field *${field}*`);
        };
        return res.status(200).send( { field: field } );
      });
    });
  }
}
