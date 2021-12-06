"use strict";

require("dotenv").config();
const express = require("express");
const middlewareFactory = require("./middlewares");
const fusionDatasource = require("fusion-datasource");
const dsConfig = require("./configs/datasource-config");
const app = express();
const serviceHandlerConfig = dsConfig.serviceHandlerConfig;
global.logger = require("pino")();
global.ds = {};

// configure the all middleware
middlewareFactory.configureMiddlewares(app);


const server = app.listen(serviceHandlerConfig.registry.payload.port);
server.on("listening", async () => {
  try {
    // get required datasources connections
    const port = server.address().port;

    global.ds = await fusionDatasource.init(serviceHandlerConfig, dsConfig.staticServices);
    // configure the all routes
    fusionDatasource.configureRoutes(app, dsConfig.baseUrl);
    fusionDatasource.register(global.ds.serviceHandler, serviceHandlerConfig.registry);
    const intervalId = setInterval(
      fusionDatasource.register,
      serviceHandlerConfig.registry.interval * 1000,
      global.ds.serviceHandler,
      serviceHandlerConfig.registry
    );

    const unregisterService = (err) => {
      // destroy db connection
      global.ds.pg.db.destroy();
      // unregister from service handler
      fusionDatasource.unregister(
        global.ds.serviceHandler,
        serviceHandlerConfig.registry,
        intervalId
      );
      console.error("runtime error : ", err);
    };

    process.on("SIGTERM", unregisterService);
    process.on("SIGINT", unregisterService);
    process.on("uncaughtException", unregisterService);
    process.on("unhandledRejection", unregisterService);

    console.log(`[INIT]: server is running on port: ${port}`);

    // run boot/init codes
    setTimeout(require("./inits"), 0);
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
});

module.exports = app;
