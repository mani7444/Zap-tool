"use strict";

const { name } = require("../../package.json");

/**
 * 1. "name" key will be used in code to access the connection of service handler
 * 2. "registry" key data will be used for service registry part
 */
const serviceHandlerConfig = {
  host: process.env.FUSION_SERVICE_HANDLER_HOST,
  port: process.env.FUSION_SERVICE_HANDLER_PORT,
  alias: "serviceHandler",
  registry: {
    payload: {
      name: name,
      version: "v1",
      port: process.env.FUSION_PATROL_SERVICE_PORT,
    },
    interval: parseInt(process.env.SERVICE_REGISTRY_INTERVAL), // register the service every 5 seconds
  },
};

/**
 * 1. if version is not provided, it's "v1" by default
 * 2. "alias" key to be used in code
 * 4. "name" key in the "dbs" is the DB name to get the connection for
 */
const staticServices = [
  {
    alias: "pg",
    name: "fusion-postgre-service",
    dbs: [{ alias: "db", name: "platform" }, { alias: "cdb", name: "configuration_management_dev" }],
  },
  {
    alias: "redis",
    name: "fusion-redis-service",
  },
  {
    alias: "tracCarServer",
    name: "fusion-traccar-service",
  },
  {
    alias: "gisService",
    name: "fusion-gis-service",
  },
  {
    alias: "routeGisService",
    name: "fusion-route-gis-service",
  },
  {
    alias: "recomendedBeatPointGisService",
    name: "fusion-recomended-beat-point-gis-service",
  },
  {
    alias: "fusionAtlantisService",
    name: "fusion-atlantis-service"
  },
  {
    alias: "fusionConfigService",
    name: "fusion-config-service"
  },
  {
    alias: "fusionDbService",
    name: "fusion-db-service",
  },
  {
    alias: "fusionNominatimService",
    name: "fusion-nominatim-service",
  },
  {
    alias: "fusionGisCrimeService",
    name: "fusion-gis-crime-service"
  },
  {
    alias: "redis",
    name: "fusion-redis-service",
  },
  {
    alias: "valhallaServer",
    name: "fusion-valhalla-service",
  },
];

const baseUrl = "/api/" + name;

module.exports = {
  serviceHandlerConfig,
  staticServices,
  baseUrl,
};
