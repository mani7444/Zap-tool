"use strict";
const { SqlErr } = require("fusion-http-response");
async function getVehiclesByDevice(payloadObj) {
  try {
    return await global.ds.pg.cdb
      .select()
      .from("f_vehicle")
      .where("f_vehicle.f_device_id", payloadObj.device_id);
  } catch (err) {
    throw new SqlErr(err);
  }
}

async function getBeatStatus(payloadObj) {
  try {
    const query =
      "SELECT distinct pspv.f_vehicle_id, dwbm.f_user_id, psm.f_name AS ps, pspv.f_pv_name AS pv_id, f_day_wise_beat_ids, beat_status, overall_status, dwbm.f_start_date_time, dwbm.f_end_date_time, dwbm.km_travelled, dwbm.f_total_beat_distance FROM f_ps_pv_map pspv, f_user_daywisebeat_mapping dwbm, f_ps_master psm WHERE  pspv.id = dwbm.f_ps_pv_map_id AND pspv.f_ps_id = psm.id AND pspv.f_ps_id = " +
      payloadObj.f_ps_id +
      " AND f_start_date_time BETWEEN '" +
      payloadObj.f_start_date_time +
      "' AND '" +
      payloadObj.f_end_date_time +
      "' ";
    return await global.ds.pg.db.raw(query);
  } catch (err) {
    throw new SqlErr(err);
  }
}

async function getVehicleData(payloadObj) {
  try {
    return await global.ds.pg.cdb
      .select()
      .from("f_vehicle")
      .where("f_vehicle.id", payloadObj.f_vehicle_id);
  } catch (err) {
    throw new SqlErr(err);
  }
}

async function getUserData(payloadObj) {
  try {
    return await global.ds.pg.cdb
      .select()
      .from("f_user_master")
      .where("f_user_master.id", payloadObj.f_user_id);
  } catch (err) {
    throw new SqlErr(err);
  }
}

async function getPsPvByVehicle(payloadObj) {
  try {
    return await global.ds.pg.db
      .select()
      .from("f_ps_pv_map")
      .where("f_ps_pv_map.f_vehicle_id", payloadObj);
  } catch (err) {
    throw new SqlErr(err);
  }
}

async function getUserDayWiseMapping(payloadObj) {
  try {
    return await global.ds.pg.db
      .select()
      .from("f_user_daywisebeat_mapping")
      .where("f_user_daywisebeat_mapping.f_ps_pv_map_id", payloadObj.pspvid)
      .whereBetween("f_user_daywisebeat_mapping.f_created_on", [
        payloadObj.startDate,
        payloadObj.endDate,
      ]);
  } catch (err) {
    throw new SqlErr(err);
  }
}

async function getbeatoftheday(payloadObj) {
  try {
    return await global.ds.pg.db
      .select("f_day_wise_beat.*",
        global.ds.pg.db.context.raw("json_agg(f_beat_plan_master.*) as beatplanmaster"),
        global.ds.pg.db.context.raw("json_agg(f_beat_point.*) as beatpoints")
      )
      .from("f_day_wise_beat")
      .leftJoin("f_beat_plan_master", "f_day_wise_beat.f_beat_plan_master_id", "f_beat_plan_master.id")
      .leftJoin("f_beat_point", "f_beat_plan_master.f_beat_point_id", "f_beat_point.id")
      .where("f_day_wise_beat.f_ps_pv_map_id", payloadObj.pspvid)
      .whereBetween("f_day_wise_beat.f_beat_date", [
        payloadObj.startDate,
        payloadObj.endDate,
      ])
      .groupBy("f_day_wise_beat.id")
  } catch (err) {
    throw new SqlErr(err);
  }
}

module.exports = {
  getVehiclesByDevice,
  getBeatStatus,
  getVehicleData,
  getUserData,
  getPsPvByVehicle,
  getUserDayWiseMapping,
  getbeatoftheday,
};
