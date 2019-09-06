const {
  INGEST_MONGO_USERNAME,
  INGEST_MONGO_PASSWORD,
  INGEST_MONGO_HOSTNAME,
  INGEST_MONGO_CONTAINER_PORT,
  INGEST_MONGO_DATABASE,
  REDIS_HOSTNAME,
  REDIS_CONTAINER_PORT,
  INGEST_CLIENT_HOST_PORT,
  INGEST_API_LOG_LEVEL,
  PROTOCOL,
  INGEST_URL,
  DASHBOARD_URL
} = process.env;

module.exports = {

  datastores: {
    default: {
      adapter: 'sails-mongo',
      url: `mongodb://${INGEST_MONGO_USERNAME}:${INGEST_MONGO_PASSWORD}@${INGEST_MONGO_HOSTNAME}:${INGEST_MONGO_CONTAINER_PORT}/${INGEST_MONGO_DATABASE}`
    }
  },

  models: {
    migrate: 'safe',
  },

  blueprints: {
    shortcuts: false,
  },

  security: {
    cors: {
      allRoutes: true,
      allowOrigins: '*',
      allowCredentials: true,
      allowAnyOriginWithCredentialsUnsafe: true
    }
  },

  session: {

    secret: 'fcea8be379be2dc12d47a5a40a0f7a98',
    adapter: '@sailshq/connect-redis',
    url: `redis://${REDIS_HOSTNAME}:${REDIS_CONTAINER_PORT}/0`,
    cookie: {
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,  // 24 hours
    }
  },

  sockets: {

    onlyAllowOrigins: [
      `${PROTOCOL}://${INGEST_URL}`,
      `${PROTOCOL}://${DASHBOARD_URL}`
    ],
    adapter: '@sailshq/socket.io-redis',
    url: `redis://${REDIS_HOSTNAME}:${REDIS_CONTAINER_PORT}/0`,
    grant3rdPartyCookie: true,
  },

  log: {
    level: INGEST_API_LOG_LEVEL || 'info'
  },

  http: {

    /***************************************************************************
    *                                                                          *
    * The number of milliseconds to cache static assets in production.         *
    * (the "max-age" to include in the "Cache-Control" response header)        *
    *                                                                          *
    ***************************************************************************/
    cache: 365.25 * 24 * 60 * 60 * 1000, // One year

    /***************************************************************************
    *                                                                          *
    * Proxy settings                                                           *
    *                                                                          *
    * If your app will be deployed behind a proxy/load balancer - for example, *
    * on a PaaS like Heroku - then uncomment the `trustProxy` setting below.   *
    * This tells Sails/Express how to interpret X-Forwarded headers.           *
    *                                                                          *
    * This setting is especially important if you are using secure cookies     *
    * (see the `cookies: secure` setting under `session` above) or if your app *
    * relies on knowing the original IP address that a request came from.      *
    *                                                                          *
    * (https://sailsjs.com/config/http)                                        *
    *                                                                          *
    ***************************************************************************/
    trustProxy: true,

  },

  // port: 80,


  custom: {}

};
