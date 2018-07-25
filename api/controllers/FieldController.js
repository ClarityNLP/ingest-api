module.exports = {

  getFields: function(req,res) {
    Field.find().exec(function(err, fields) {
      if (err) {
        sails.log.error(err);
        return res.status(500).send({});
      }
      const massagedFields = fields.reduce((result, field) => {
        result[field.field] = {
          name: field.name,
          type: field.type,
          validationMessage: field.validationMessage,
          requiredType: field.requiredType,
          sourceField: null,
          value: null
        }
        return result;
      }, {});
      return res.status(200).send(massagedFields);
    });
  }
}
