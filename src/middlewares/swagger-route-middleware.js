"use strict";

const swaggerUi = require("swagger-ui-express");
const swaggerV1Route = require("../files/api-docs/v1.json");
const dsConfig = require("../configs/datasource-config");

module.exports = (app) => {
  const shConfig = dsConfig.serviceHandlerConfig;
  const serviceHandlerUrl = `http://${shConfig.host}:${shConfig.port}${dsConfig.baseUrl}`;
  swaggerV1Route.servers[0].url = serviceHandlerUrl;
  return app.use(
    `${dsConfig.baseUrl}/api-docs/v1`,
    swaggerUi.serve,
    swaggerUi.setup(swaggerV1Route)
  );
};
