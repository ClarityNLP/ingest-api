const {
  REDIS_HOSTNAME,
  REDIS_CONTAINER_PORT,
  PROTOCOL,
  DOMAIN,
  INGEST_URL,
  DASHBOARD_URL
} = process.env;

module.exports.sockets = {

  onlyAllowOrigins: [
    `${PROTOCOL}://${INGEST_URL}`,
    `${PROTOCOL}://${DASHBOARD_URL}`
  ],
  adapter: '@sailshq/socket.io-redis',
  url: `redis://${REDIS_HOSTNAME}:${REDIS_CONTAINER_PORT}/0`,
  grant3rdPartyCookie: true
};
