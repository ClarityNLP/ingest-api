module.exports = {

  datastores: {
    default: {
      adapter: 'sails-mongo',
      url: `mongodb://${process.env.INGEST_MONGO_HOSTNAME}:${process.env.INGEST_MONGO_CONTAINER_PORT}/${process.env.INGEST_MONGO_DATABASE}`
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
    url: `redis://${process.env.MAPPER_REDIS_HOSTNAME}:${process.env.MAPPER_REDIS_CONTAINER_PORT}/0`,
    cookie: {
      // secure: true,
      maxAge: 24 * 60 * 60 * 1000,  // 24 hours
    }
  },

  sockets: {

    onlyAllowOrigins: [
      process.env.BASE_URL,
      `${process.env.BASE_URL}:${process.env.INGEST_CLIENT_HOST_PORT}`
    ],

    adapter: '@sailshq/socket.io-redis',
    url: `redis://${process.env.MAPPER_REDIS_HOSTNAME}:${process.env.MAPPER_REDIS_CONTAINER_PORT}/0`,
    // url: 'redis://user:password@bigsquid.redistogo.com:9562/dbname',
  },

  log: {
    level: process.env.INGEST_API_LOG_LEVEL || 'info'
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
    // trustProxy: true,

  },



  /**************************************************************************
  *                                                                         *
  * Lift the server on port 80.                                             *
  * (if deploying behind a proxy, or to a PaaS like Heroku or Deis, you     *
  * probably don't need to set a port here, because it is oftentimes        *
  * handled for you automatically.  If you are not sure if you need to set  *
  * this, just try deploying without setting it and see if it works.)       *
  *                                                                         *
  ***************************************************************************/
  // port: 80,


  custom: {}

};
