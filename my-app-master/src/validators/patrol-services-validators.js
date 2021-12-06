"use strict";

const validator = new (require("fastest-validator"))();

const getPsPvByIdValidator = validator.compile({
    id: { type: "string"}
});

const routeValidator = validator.compile({
  psId: { type: "string"}
});

const checkAssignedPatrolRouteValidator = validator.compile({
  ps_pv_id: { type: "string"}
});

const postUserMappingValidator = validator.compile({
  f_user_id: { type: "string"},
  f_start_date_time: { type: "string"},
  f_end_date_time: { type: "string"},
  f_updated_by: { type: "string"},
  f_ps_pv_map_id: { type: "string"}
});

const userDayWiseMappingValidator = validator.compile({
  id: { type: "string"}
});

const addCoOfficerValidator = validator.compile({
  id: { type: "string"},
  officerId: { type: "string"},
  shift_hours: { type: "string"}
});

const beatPointsValidator = validator.compile({
  f_beat_name: { type: "string"},
  lat: { type: "string"},
  lng: { type: "string"}
});

const coFieldOfficersValidator = validator.compile({
  userId: { type: "number"}
});

const beatPointListValidator = validator.compile({
  f_ps_pv_map_id: { type: "number"},
  f_plan_type: { type: "string"},
  f_is_active: { type: "number"},
});

module.exports = {
  getPsPvByIdValidator,
  routeValidator,
  checkAssignedPatrolRouteValidator,
  postUserMappingValidator,
  userDayWiseMappingValidator,
  addCoOfficerValidator,
  beatPointsValidator,
  coFieldOfficersValidator,
  beatPointListValidator
};