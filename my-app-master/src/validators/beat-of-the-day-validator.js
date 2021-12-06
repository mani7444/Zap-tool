"use strict";

const validator = new (require("fastest-validator"))();

const dayOftheBeatValidator = validator.compile({
    ps_pv_id: { type: "string", optional: false },
});

  module.exports = {
    dayOftheBeatValidator
  };