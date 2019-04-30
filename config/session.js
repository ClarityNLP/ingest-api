const {
  REDIS_HOSTNAME,
  REDIS_CONTAINER_PORT
} = process.env

module.exports.session = {

  secret: '6fb5c351949f2002ffb62e275fe00523',
  adapter: '@sailshq/connect-redis',
  url: `redis://${REDIS_HOSTNAME}:${REDIS_CONTAINER_PORT}/0`
};
