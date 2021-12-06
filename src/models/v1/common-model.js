"use strict";

const { SqlErr } = require("fusion-http-response");

async function getIncidentActions() {
  try {
    return await global.ds.pg.db.select().from("f_incident_action");
  } catch (err) {
    throw new SqlErr(err);
  }
}
async function getIncidentTypes() {
  try {
    return await global.ds.pg.db
      .select(
        "f_incident_type.*",
        global.ds.pg.db.context.raw(
          "json_agg(f_incident_sub_type.*) as subtypes"
        )
      )
      .from("f_incident_type")
      .join(
        "f_incident_sub_type",
        "f_incident_type.id",
        "f_incident_sub_type.f_incident_type_id"
      )
      .groupBy("f_incident_type.id")
      .orderBy("f_incident_type.id", "asc");
  } catch (err) {
    throw new SqlErr(err);
  }
}
async function getIncidentSubTypes() {
  try {
    return await global.ds.pg.db
      .select()
      .from("f_incident_sub_type")
      .orderBy("f_incident_sub_type.id", "asc");
  } catch (err) {
    throw new SqlErr(err);
  }
}
async function getListOfStatus() {
  try {
    return await global.ds.pg.db
      .select()
      .from("f_status")
      .orderBy("f_status.id", "asc");
  } catch (err) {
    throw new SqlErr(err);
  }
}
async function getStatusById(status_id) {
  try {
    return await global.ds.pg.db
      .select()
      .from("f_status")
      .where("f_status.id", status_id);
  } catch (err) {
    throw new SqlErr(err);
  }
}
async function updateIncidentReportById(payloadObj) {
  try {
    return await global.ds.pg
      .db("f_incident_report")
      .insert(payloadObj)
      .returning("*");
  } catch (err) {
    throw new SqlErr(err);
  }
}
async function updateFieldOfficerStatus(payloadObj) {
  try {
    return await global.ds.pg
      .db("f_ps_pv_map")
      .where("id", payloadObj.id)
      .update(payloadObj.updateBody)
      .returning("*");
  } catch (err) {
    throw new SqlErr(err);
  }
}
async function incidentListByUserId(payloadObj) {
  try {
    const limitPerPage = payloadObj.limit || 10;
    const page = Math.max(payloadObj.pageNumber || 1, 1);
    const offset = (page - 1) * limitPerPage;
    let queryWhere;
    let conditionVal;
    if (payloadObj.userId) {
      queryWhere = "f_incident_master.f_alert_source";
      conditionVal = payloadObj.userId;
    } else if (payloadObj.routeId) {
      queryWhere = "f_incident_master.f_user";
      conditionVal = payloadObj.routeId;
    } else if (payloadObj.incidentId) {
      queryWhere = "f_incident_master.id";
      conditionVal = payloadObj.incidentId;
    } else if (payloadObj.entityId) {
      queryWhere = "f_incident_master.f_entity_id";
      conditionVal = payloadObj.entities;
    }
    let responseData;
    let totalCount;
    if (payloadObj.entityId) {
      responseData = await global.ds.pg.db
        .select(
          "f_incident_master.*",
          global.ds.pg.db.context.raw(
            "json_agg(f_status.*) as incident_status"
          ),
          global.ds.pg.db.context.raw(
            "json_agg(f_incident_type.*) as f_incident_type"
          ),
          global.ds.pg.db.context.raw(
            "json_agg(f_incident_sub_type.*) as f_incident_sub_type"
          ),
          global.ds.pg.db.context.raw(
            "json_agg(f_incident_report.*) as incident_reports"
          )
        )
        .from("f_incident_master")
        .leftJoin("f_status", "f_incident_master.f_status_id", "f_status.id")
        .leftJoin(
          "f_incident_type",
          "f_incident_master.f_incident_type_id",
          "f_incident_type.id"
        )
        .leftJoin(
          "f_incident_sub_type",
          "f_incident_master.f_incident_sub_type_id",
          "f_incident_sub_type.id"
        )
        .leftJoin(
          "f_incident_report",
          "f_incident_master.id",
          "f_incident_report.f_incident_id"
        )
        .limit(limitPerPage)
        .offset(offset)
        .whereIn(queryWhere, conditionVal)
        .groupBy("f_incident_master.id")
        .orderBy("f_incident_master.f_created_on", "desc");
      totalCount = await global.ds.pg.db
        .select()
        .from("f_incident_master")
        .count("f_incident_master.id")
        .whereIn(queryWhere, conditionVal);
    } else {
      responseData = await global.ds.pg.db
        .select(
          "f_incident_master.*",
          global.ds.pg.db.context.raw(
            "json_agg(f_status.*) as incident_status"
          ),
          global.ds.pg.db.context.raw(
            "json_agg(f_incident_type.*) as f_incident_type"
          ),
          global.ds.pg.db.context.raw(
            "json_agg(f_incident_sub_type.*) as f_incident_sub_type"
          ),
          global.ds.pg.db.context.raw(
            "json_agg(f_incident_report.*) as incident_reports"
          )
        )
        .from("f_incident_master")
        .leftJoin("f_status", "f_incident_master.f_status_id", "f_status.id")
        .leftJoin(
          "f_incident_type",
          "f_incident_master.f_incident_type_id",
          "f_incident_type.id"
        )
        .leftJoin(
          "f_incident_sub_type",
          "f_incident_master.f_incident_sub_type_id",
          "f_incident_sub_type.id"
        )
        .leftJoin(
          "f_incident_report",
          "f_incident_master.id",
          "f_incident_report.f_incident_id"
        )
        .limit(limitPerPage)
        .offset(offset)
        .where(queryWhere, conditionVal)
        .orderBy("f_incident_master.f_created_on", "desc")
        .groupBy("f_incident_master.id");
      totalCount = await global.ds.pg.db
        .select()
        .from("f_incident_master")
        .count("f_incident_master.id")
        .where(queryWhere, conditionVal);
    }

    return {
      responseData,
      totalCount,
    };
  } catch (err) {
    throw new SqlErr(err);
  }
}
async function getUserDetails(username) {
  try {
    return await global.ds.pg.db
      .select(
        "f_user_master.*",
        global.ds.pg.db.context.raw("json_agg(distinct f_role.*) as roles"),
        global.ds.pg.db.context.raw(
          "json_agg(distinct f_activity.*) as activity"
        ),
        global.ds.pg.db.context.raw(
          "json_agg(distinct sm_following.*) as following_keywords"
        ),
        global.ds.pg.db.context.raw("json_agg(distinct sm_keys.*) as sm_keys"),
        global.ds.pg.db.context.raw("json_agg(f_ps_master.*) as police")
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
      .leftJoin(
        "sm_fuser_following_mapping",
        "f_user_master.id",
        "sm_fuser_following_mapping.f_user_id"
      )
      .leftJoin(
        "sm_following",
        "sm_fuser_following_mapping.sm_following_id",
        "sm_following.id"
      )
      .leftJoin("sm_keys", "f_user_master.id", "sm_keys.f_user_id")
      .leftJoin("f_ps_master", "f_user_master.f_ps_id", "f_ps_master.id")
      .where("f_username", username)
      .groupBy("f_user_master.id", "f_ps_master.id");
  } catch (err) {
    throw new SqlErr(err);
  }
}
async function createIncident(payloadObj) {
  try {
    return await global.ds.pg
      .db("f_incident_master")
      .insert(payloadObj)
      .returning("*");
  } catch (err) {
    throw new SqlErr(err);
  }
}
async function policeStations() {
  try {
    return await global.ds.pg.db
      .select()
      .from("f_ps_master")
      .orderBy("f_ps_master.id", "asc");
  } catch (err) {
    throw new SqlErr(err);
  }
}
async function policeStationById(payloadObj) {
  try {
    return await global.ds.pg.db
      .select()
      .from("f_ps_master")
      .where("f_ps_master.id", payloadObj.id);
  } catch (err) {
    throw new SqlErr(err);
  }
}
async function updateTokenForUser(payloadObj) {
  try {
    return await global.ds.pg.cdb
      .update(payloadObj)
      .into("f_user_master")
      .where("id", payloadObj.id)
      .returning("*");
  } catch (err) {
    throw new SqlErr(err);
  }
}
async function getUserIdByEntityId(payloadObj) {
  try {
    return await global.ds.pg.cdb
      .select()
      .from("f_user_organization_mapping")
      .where("f_user_organization_mapping.f_entity_id", payloadObj.entityId);
  } catch (err) {
    throw new SqlErr(err);
  }
}
async function getUserDataByUserId(userId) {
  try {
    return await global.ds.pg.cdb
      .select()
      .from("f_user_master")
      .where("f_user_master.id", userId);
  } catch (err) {
    throw new SqlErr(err);
  }
}
async function getvehicleDetails(deviceId) {
  try {
    return await global.ds.pg.db
      .select(
        "f_vehicle.*",
        global.ds.pg.db.context.raw("json_agg(f_ps_master.*) as psData"),
        global.ds.pg.db.context.raw("json_agg(f_ps_pv_map.*) as psPvMap")
      )
      .from("f_vehicle")
      .leftJoin("f_ps_master", "f_vehicle.f_ps_id", "f_ps_master.id")
      .leftJoin("f_ps_pv_map", "f_ps_pv_map.f_vehicle_id", "f_vehicle.id")
      .where("f_vehicle.f_device_id", deviceId)
      .groupBy("f_vehicle.id");
  } catch (err) {
    throw new SqlErr(err);
  }
}
async function updateIncidentStatus(payloadObj, body_parameters) {
  try {
    body_parameters["f_updated_on"] = new Date();
    return await global.ds.pg
      .db("f_incident_master")
      .where("id", payloadObj.incidentId)
      .update(body_parameters)
      .returning("*");
  } catch (err) {
    throw new SqlErr(err);
  }
}
async function upload(payloadObj) {
  try {
    return await global.ds.pg
      .db("f_incident_myimage")
      .insert(payloadObj)
      .returning("*");
  } catch (err) {
    throw new SqlErr(err);
  }
}
async function getPoliceStations(payloadObj) {
  try {
    return await global.ds.pg.db
      .select()
      .from("f_ps_master")
      .where("f_ps_master.id", payloadObj.psId);
  } catch (err) {
    throw new SqlErr(err);
  }
}
async function getVehcilesByEntity(code) {
  try {
    return await global.ds.pg.cdb
      .select(
        "f_vehicle.id",
        "f_vehicle.f_vehicle_no",
        "f_vehicle.f_device_id",
        "f_vehicle.f_device_unique_id",
        "f_vehicle_type.f_type_name as f_vehicle_type"
      )
      .from("f_entity")
      .join("f_vehicle", "f_entity.id", "f_vehicle.f_entity_id")
      .join(
        "f_vehicle_type",
        "f_vehicle.f_vehicle_type_id",
        "f_vehicle_type.id"
      )
      .where("f_entity.f_entity_code", code);
  } catch (err) {
    throw new SqlErr(err);
  }
}
async function getRouteByVechicle(vehicleId) {
  try {
    return await global.ds.pg.db
      .select()
      .from("f_ps_pv_map")
      .where("f_ps_pv_map.f_vehicle_id", vehicleId);
  } catch (err) {
    throw new SqlErr(err);
  }
}
module.exports = {
  getIncidentActions,
  getIncidentTypes,
  getIncidentSubTypes,
  getListOfStatus,
  getStatusById,
  updateIncidentReportById,
  updateFieldOfficerStatus,
  incidentListByUserId,
  getUserDetails,
  createIncident,
  policeStations,
  policeStationById,
  updateTokenForUser,
  getUserIdByEntityId,
  getUserDataByUserId,
  getvehicleDetails,
  updateIncidentStatus,
  upload,
  getPoliceStations,
  getVehcilesByEntity,
  getRouteByVechicle,
};
