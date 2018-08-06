module.exports.routes = {

  //create ingest record
  'post /ingest/csv': 'CsvController.createIngest',

  //get fields
  'get /fields': 'FieldController.getFields',

  //create field
  'post /fields': 'FieldController.createCustomField',

  //delete field
  'delete /fields/:field': 'FieldController.deleteField',

  //ingest jobs
  'post /ingest/:ingestId/schedule': 'CsvController.scheduleIngestJob',

  //get paginated ingest records
  'get /ingest': 'IngestController.getPageOfIngestRecords',

  //delete ingest record and documents from solr
  'get /ingest/:ingestId/delete': 'IngestController.deleteRecordandDocsFromSolr',

  //solr stats
  'get /solr/core': 'SolrController.core',
  'get /solr/numDocs': 'SolrController.numDocs',

  //user
  'get /me': 'UserController.me', //get user's session

  //csv file upload
  'post /upload': 'FileController.upload',

  //chunk status check
  'get /upload': 'FileController.chunkStatusCheck',

  //retrieve file identifier, invoke with /fileid?filename=my-file.jpg
  'get /fileid': 'FileController.fileId',

  //download file
  'get /download/:identifier': 'FileController.download'
};
