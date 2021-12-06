"use strict";

const validator = new (require("fastest-validator"))();

const recommendedBeatPointValidator = validator.compile({
    ps_id: { type: "number", optional: false },
    sector_ids: { type: "array", optional: false },
});

module.exports = {
  recommendedBeatPointValidator
};