"use strict";

const { urlencoded, json } = require("express");

module.exports = (app) => {
  app.use(json({ limit: "1mb" }));
  return app.use(urlencoded({ extended: true }));
};
