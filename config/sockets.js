const {
  REDIS_HOSTNAME,
  REDIS_CONTAINER_PORT,
  PROTOCOL,
  DOMAIN,
  INGEST_CLIENT_SUBDOMAIN,
  DASHBOARD_CLIENT_SUBDOMAIN
} = process.env;

module.exports.sockets = {

  onlyAllowOrigins: [
    `${PROTOCOL}://${INGEST_CLIENT_SUBDOMAIN}.${DOMAIN}`,
    `${PROTOCOL}://${DASHBOARD_CLIENT_SUBDOMAIN}.${DOMAIN}`
  ],
  adapter: '@sailshq/socket.io-redis',
  url: `redis://${REDIS_HOSTNAME}:${REDIS_CONTAINER_PORT}/0`,
  grant3rdPartyCookie: true,
};
