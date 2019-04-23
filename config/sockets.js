const {
  REDIS_HOSTNAME,
  REDIS_CONTAINER_PORT,
  PROTOCOL,
  DOMAIN,
  INGEST_CLIENT_SUBDOMAIN,
} = process.env;

module.exports.sockets = {

  onlyAllowOrigins: [
    `${PROTOCOL}://${INGEST_CLIENT_SUBDOMAIN}.${DOMAIN}`
  ],
  adapter: '@sailshq/socket.io-redis',
  url: `redis://${REDIS_HOSTNAME}:${REDIS_CONTAINER_PORT}/0`,

  /***************************************************************************
  *                                                                          *
  * Whether to expose a 'GET /__getcookie' route that sets an HTTP-only      *
  * session cookie.  //TODO                                                       *
  *                                                                          *
  ***************************************************************************/

  grant3rdPartyCookie: true,
};
