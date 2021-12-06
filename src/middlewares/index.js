"use strict";

const middlewares = [
  require("./bodyparser-middleware"),
  require("./compression-middleware"),
  require("./helmet-middleware"),
  require("./swagger-route-middleware"),
  require("./url-rewrite-middleware"),
  require("./org-entity-middleware"),
];

const configureMiddlewares = (app) => {
  for (const middleware of middlewares) {
    middleware(app);
  }
};

module.exports = {
  configureMiddlewares,
};
