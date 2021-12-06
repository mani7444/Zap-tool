"use strict";

const validator = new (require("fastest-validator"))();

const addDayWiseBeatMapValidator = validator.compile({
  id: { type: "number", optional: true },
  f_beat_point_id: { type: "number" },
  f_ps_pv_map_id: { type: "number" },
  f_day_wise_beat_id: { type: "number" },
  f_beat_geo_point: { type: "object" },
  f_comments: {type: "string", optional: true},
  f_created_on: { type: "string", default: () => new Date(), optional: true },
  f_updated_on: { type: "string", default: () => new Date(), optional: true },
  f_created_by: { type: "number", optional: true, default: 1},
  f_updated_by: { type: "number", optional: true, default: 1}
});

const updateDaywiseBeatsValidator = validator.compile({
  route_ID: { type: "number"},
  f_beat_completion_time: { type: "string"},
  f_beat_status: {type: "number"},
  f_updated_by: {type: "number"}
});

module.exports = {
  addDayWiseBeatMapValidator,
  updateDaywiseBeatsValidator
};
