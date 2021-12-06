"use strict";

const { SqlErr } = require("fusion-http-response");

async function updateBeatPoints(payloadObj) {
  try {
    return await global.ds.pg.db
      .batchInsert("f_beat_point", payloadObj).returning("*");
  } catch (err) {
    throw new SqlErr(err);
  }
}

async function updateBeatPlanMatser(payloadObj) {
  try {
    return await global.ds.pg.db
      .batchInsert("f_beat_plan_master", payloadObj).returning("*");
  } catch (err) {
    throw new SqlErr(err);
  }
}

module.exports = {
  updateBeatPoints,
  updateBeatPlanMatser
};
