module.exports = {

  field: function() {
    return [
      {
        field: 'source',
        name: 'Document Source',
        type: 'text',
        validationMessage: 'ClarityNLP needs a value for Solr field \'source\'. If you omit this field, the ingestion engine will assign a default value on your behalf.',
        requiredType: 'soft',
        isCustom: false
      },
      {
        field: 'subject',
        name: 'Patient Id',
        type: 'select',
        validationMessage: 'ClarityNLP needs a value for Solr field \'subject\'. If you omit this field, the ingestion engine will assign a default value on your behalf.',
        requiredType: 'soft',
        isCustom: false,
        inputTypeLocked: true
      },
      {
        field: 'report_date',
        name: 'Report Date',
        type: 'select',
        validationMessage: 'ClarityNLP needs a value for Solr field \'report_date\'. If you omit this field, the ingestion engine will assign a default value on your behalf.',
        requiredType: 'soft',
        isCustom: false
      },
      {
        field: 'report_id',
        name: 'Report Id',
        type: 'select',
        validationMessage: 'ClarityNLP needs a value for Solr field \'report_id\'. If you omit this field, the ingestion engine will assign a default value on your behalf.',
        requiredType: 'soft',
        isCustom: false
      },
      {
        field: 'report_type',
        name: 'Report Type',
        type: 'select',
        validationMessage: 'ClarityNLP needs a value for Solr field \'report_type\'. If you omit this field, the ingestion engine will assign a default value on your behalf.',
        requiredType: 'soft',
        isCustom: false
      },
      {
        field: 'report_text',
        name: 'Report Text',
        type: 'select',
        validationMessage: 'ClarityNLP needs a value for Solr field \'report_text\'. You cannot start the ingestion process until you assign a value to this field.',
        requiredType: 'hard',
        isCustom: false,
        inputTypeLocked: true
      }
    ];
  }
}
