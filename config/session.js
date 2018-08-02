module.exports.session = {

  secret: '6fb5c351949f2002ffb62e275fe00523',
  adapter: '@sailshq/connect-redis',
  url: `redis://${process.env.REDIS_HOSTNAME}:${process.env.REDIS_CONTAINER_PORT}/0`
};
