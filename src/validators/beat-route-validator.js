"use strict";

const validator = new (require("fastest-validator"))();

const beatRouteValidator = validator.compile({
    points: { type: "array", optional: false },
});

  module.exports = {
    beatRouteValidator
  };