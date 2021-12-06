"use strict";

const { baseUrl } = require("../configs/datasource-config");

module.exports = (app) => {
  return app.use((req, res, next) => {
    req.url = req.url.replace(
      baseUrl,
      `${baseUrl}/` + (req.headers["accept-version"] || "v1").toLowerCase()
    );
    next();
  });
};
