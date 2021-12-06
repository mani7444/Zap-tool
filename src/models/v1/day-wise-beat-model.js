"use strict";

const { SqlErr } = require("fusion-http-response");

async function addDayWiseBeatPointId(payloadObj) {
  try {
    return await global.ds.pg
      .db("f_user_daywise_beat_point_log")
      .insert(payloadObj);
  } catch (err) {
    console.log(err);
    throw new SqlErr(err);
  }
}

async function getDaywiseBeatLog() {
  try {
    return await global.ds.pg.db.select().from("f_user_daywise_beat_point_log");
  } catch (err) {
    console.log(err);
    throw new SqlErr();
  }
}

async function getDaywiseBeatLogById(id) {
  try {
    return await global.ds.pg.db
      .select()
      .from("f_user_daywise_beat_point_log")
      .where("id", id);
  } catch (err) {
    console.log(err);
    throw new SqlErr();
  }
}

async function updateDayWiseBeats(payloadObj) {
  try {
    let bodyparameters = {
      f_beat_completion_time: payloadObj.f_beat_completion_time,
      f_beat_status: payloadObj.f_beat_status,
      f_updated_by: payloadObj.f_updated_by,
    };
    return await global.ds.pg
      .db("f_day_wise_beat")
      .where("id", payloadObj.route_ID)
      .update(bodyparameters)
      .returning("*");
  } catch (err) {
    throw new SqlErr(err);
  }
}

async function getBeatList(beat_master_id) {
  try {
    return await global.ds.pg.db
      .select(
        "f_beat_plan_master.*",
        global.ds.pg.db.context.raw("json_agg(f_beat_point.*) as beatPoints")
      )
      .from("f_beat_plan_master")
      .join(
        "f_beat_point",
        "f_beat_plan_master.f_beat_point_id",
        "f_beat_point.id"
      )
      .where("f_beat_plan_master.id", beat_master_id)
      .groupBy("f_beat_plan_master.id")
  } catch (err) {
    throw new SqlErr();
  }
}

module.exports = {
  addDayWiseBeatPointId,
  getDaywiseBeatLog,
  getDaywiseBeatLogById,
  updateDayWiseBeats,
  getBeatList,
};
