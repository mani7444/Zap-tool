"use strict";

const { SqlErr } = require("fusion-http-response");

async function getPsPvMapById(payloadObj) {
  try {
    return await global.ds.pg.db
      .select(
        "f_ps_pv_map.*",
        global.ds.pg.db.context.raw(
          "json_agg(f_ps_master.*) as police_station_data"
        )
      )
      .from("f_ps_pv_map")
      .leftJoin("f_ps_master", "f_ps_pv_map.f_ps_id", "f_ps_master.id")
      .where("f_ps_pv_map.id", payloadObj.id)
      .groupBy("f_ps_pv_map.id");
  } catch (err) {
    throw new SqlErr(err);
  }
}

async function getRoute(payloadObj) {
  try {
    return await global.ds.pg.db
      .select()
      .from("f_ps_pv_map")
      .where("f_ps_pv_map.f_ps_id", payloadObj.psId);
  } catch (err) {
    throw new SqlErr(err);
  }
}

async function checkAssignedPatrolRoute(payloadObj) {
  try {
    let date = new Date();
    let today_date =
      date.getFullYear() +
      "-" +
      (date.getMonth() + 1) +
      "-" +
      date.getDate() +
      " 00:00:00";
    return await global.ds.pg.db
      .select()
      .from("f_ps_pv_map")
      .where("f_ps_pv_map.id", payloadObj.ps_pv_id)
      .andWhere("f_ps_pv_map.f_updated_on", ">", today_date);
  } catch (err) {
    throw new SqlErr(err);
  }
}

async function postUserMapping(payloadObj) {
  try {
    var startDate = new Date(payloadObj.f_start_date_time);
    startDate = startDate.toISOString().split("T")[0];
    startDate = new Date(startDate);
    var endDate = new Date(payloadObj.f_end_date_time);
    endDate = endDate.toISOString().split("T")[0];
    endDate = new Date(endDate);
    endDate.setDate(endDate.getDate() + 1);
    return await global.ds.pg.db
      .select()
      .from("f_day_wise_beat")
      .where("f_day_wise_beat.f_ps_pv_map_id", payloadObj.f_ps_pv_map_id)
      .whereBetween("f_day_wise_beat.f_beat_date", [startDate, endDate]);
  } catch (err) {
    throw new SqlErr(err);
  }
}

async function insertMappingData(payloadObj) {
  try {
    var f_day_wise_beat_ids_count = payloadObj.f_day_wise_beat_ids.length;
    var total_day_wise_beat_points_count =
      payloadObj.f_day_wise_beat_ids_total.length;
    payloadObj.beat_status =
      f_day_wise_beat_ids_count.toString() +
      "/" +
      total_day_wise_beat_points_count.toString();
    payloadObj.overall_status =
      ((f_day_wise_beat_ids_count / total_day_wise_beat_points_count) * 100)
        .toFixed(2)
        .toString() + "%";
    payloadObj.f_created_by = payloadObj.f_user_id;
    payloadObj.f_updated_by = payloadObj.f_user_id;
    var t = new Date();
    payloadObj.f_updated_on = t.toISOString();
    payloadObj.f_created_on = t.toISOString();
    var dataIds;
    if (payloadObj.f_day_wise_beat_ids.length > 0) {
      dataIds = "{" + payloadObj.f_day_wise_beat_ids + "}";
    }
    payloadObj.f_day_wise_beat_ids = dataIds;
    delete payloadObj.f_day_wise_beat_ids_total;
    return await global.ds.pg
      .db("f_user_daywisebeat_mapping")
      .insert(payloadObj)
      .returning("*");
  } catch (err) {
    throw new SqlErr(err);
  }
}

async function userDayWiseMapping(payloadObj) {
  try {
    return await global.ds.pg.db
      .select("f_user_daywisebeat_mapping.*")
      .from("f_user_daywisebeat_mapping")
      .where("f_user_daywisebeat_mapping.id", payloadObj.id);
  } catch (err) {
    throw new SqlErr(err);
  }
}

async function getBeatData(beatId) {
  try {
    return await global.ds.pg.db
      .select(
        "f_day_wise_beat.*",
        global.ds.pg.db.context.raw(
          "json_agg(f_beat_plan_master.*) as beat_point_master"
        ),
        global.ds.pg.db.context.raw("json_agg(f_beat_point.*) as beat_point")
      )
      .from("f_day_wise_beat")
      .leftJoin(
        "f_beat_plan_master",
        "f_day_wise_beat.f_beat_plan_master_id",
        "f_beat_plan_master.id"
      )
      .leftJoin(
        "f_beat_point",
        "f_beat_plan_master.f_beat_point_id",
        "f_beat_point.id"
      )
      .where("f_day_wise_beat.id", beatId)
      .groupBy("f_day_wise_beat.id");
  } catch (err) {
    throw new SqlErr(err);
  }
}

async function addCoOfficer(payloadObj) {
  try {
    let bodyparameters = {
      f_co_user_id: payloadObj.officerId,
      f_shift_hours: payloadObj.shift_hours,
    };
    return await global.ds.pg
      .db("f_user_daywisebeat_mapping")
      .where("id", payloadObj.id)
      .update(bodyparameters)
      .returning("*");
  } catch (err) {
    throw new SqlErr(err);
  }
}

async function addCoOfficer(payloadObj) {
  try {
    let bodyparameters = {
      f_co_user_id: payloadObj.officerId,
      f_shift_hours: payloadObj.shift_hours,
    };
    return await global.ds.pg
      .db("f_user_daywisebeat_mapping")
      .where("id", payloadObj.id)
      .update(bodyparameters)
      .returning("*");
  } catch (err) {
    throw new SqlErr(err);
  }
}

async function updateDaywiseBeatMapping(payloadObj, params) {
  try {
    return await global.ds.pg
      .db("f_user_daywisebeat_mapping")
      .where("id", payloadObj.id)
      .update(params)
      .returning("*");
  } catch (err) {
    throw new SqlErr(err);
  }
}

async function beatPoints(payloadObj) {
  delete payloadObj.type;
  delete payloadObj.source;
  delete payloadObj.psId;
  delete payloadObj.fo_user_id;
  try {
    return await global.ds.pg
      .db("f_beat_point")
      .insert(payloadObj)
      .returning("*");
  } catch (err) {
    throw new SqlErr(err);
  }
}

async function coFieldOfficersList(payloadObj) {
  try {
    return await global.ds.pg.db
      .select(
        "f_user_master.*",
        global.ds.pg.db.context.raw("json_agg(distinct f_role.*) as roles"),
        global.ds.pg.db.context.raw(
          "json_agg(distinct f_activity.*) as activity"
        )
      )
      .from("f_user_master")
      .leftJoin(
        "f_user_role_mapping",
        "f_user_master.id",
        "f_user_role_mapping.f_user_id"
      )
      .leftJoin("f_role", "f_user_role_mapping.f_role_id", "f_role.id")
      .leftJoin(
        "f_activity_role_mapping",
        "f_role.id",
        "f_activity_role_mapping.f_role_id"
      )
      .leftJoin(
        "f_activity",
        "f_activity_role_mapping.f_activity_id",
        "f_activity.id"
      )
      .where("f_user_master.id", "<>", payloadObj.userId)
      .groupBy("f_user_master.id");
  } catch (err) {
    throw new SqlErr(err);
  }
}

async function getVehicleById(vehicle_id) {
  try {
    return await global.ds.pg.cdb
      .select()
      .from("f_vehicle")
      .where("f_vehicle.id", vehicle_id);
  } catch (err) {
    throw new SqlErr(err);
  }
}
async function getBeatPointsList(payloadObj) {
  try {
    return await global.ds.pg.db
      .select(
        "f_beat_plan_master.*",
        global.ds.pg.db.context.raw(
          "json_agg(f_beat_point.*) as beatPoints"
        )
      )
      .from("f_beat_plan_master")
      .join(
        "f_beat_point",
        "f_beat_plan_master.f_beat_point_id",
        "f_beat_point.id"
      )
      .where("f_beat_plan_master.f_ps_pv_map_id", payloadObj.f_ps_pv_map_id)
      .andWhere("f_beat_plan_master.f_is_active", payloadObj.f_is_active)
      .andWhere("f_beat_plan_master.f_plan_type", payloadObj.f_plan_type)
      .groupBy("f_beat_plan_master.id")
  } catch (err) {
    throw new SqlErr(err);
  }
}
async function updateBeatPlanMaster(payloadObj) {
  try {
    const bodyparameters = {
      f_is_active: payloadObj.is_active
    }
    return await global.ds.pg
    .db("f_beat_plan_master")
    .where("f_ps_pv_map_id", payloadObj.psPvId)
    .update(bodyparameters)
  } catch (err) {
    throw new SqlErr(err);
  }
}
async function createBeatPlanMaster(payloadObj) {
  try {
    return await global.ds.pg.db()
    .batchInsert("f_beat_plan_master", payloadObj)
    .returning("*");
  } catch (err) {
    throw new SqlErr(err);
  }
}
async function getPsPvMap(payloadObj) {
  try {
    return await global.ds.pg.db
      .select(
        "f_ps_pv_map.*",
        global.ds.pg.db.context.raw(
          "json_agg(f_ps_master.*) as police_station_data"
        )
      )
      .from("f_ps_pv_map")
      .leftJoin("f_ps_master", "f_ps_pv_map.f_ps_id", "f_ps_master.id")
      .groupBy("f_ps_pv_map.id");
  } catch (err) {
    throw new SqlErr(err);
  }
}
module.exports = {
  getPsPvMapById,
  getRoute,
  checkAssignedPatrolRoute,
  postUserMapping,
  insertMappingData,
  userDayWiseMapping,
  getBeatData,
  addCoOfficer,
  updateDaywiseBeatMapping,
  beatPoints,
  coFieldOfficersList,
  getVehicleById,
  getBeatPointsList,
  updateBeatPlanMaster,
  createBeatPlanMaster,
  getPsPvMap
};
