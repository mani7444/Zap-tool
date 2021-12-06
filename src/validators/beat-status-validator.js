"use strict";

const validator = new (require("fastest-validator"))();

const beatStatusValidator = validator.compile({
  f_ps_id: { type: "number" },
  f_start_date_time: { type: "string"},
  f_end_date_time: { type: "string"},
});

module.exports = {
  beatStatusValidator,
};
