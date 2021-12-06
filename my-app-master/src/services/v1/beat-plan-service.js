"use strict";

const { Response, BadRequestErr } = require("fusion-http-response");
const beatPlanModel = require("../../models/v1/beat-plan-model");
const { keyBy, map } = require("lodash");
const axios = require("axios");

async function getSectorsData(query) {
  try {
    if (query.psId) {
      const res = await global.ds.fusionGisCrimeService.get(
        `api/GIS/pssectors?ps_id=${query.psId}`
      );
      return res.data;
    } else {
      throw new BadRequestErr("Required parameters not sent");
    }
  } catch (err) {
    throw err;
  }
}

async function getBoundaryData(query) {
  try {
    if (query.psId) {
      const res = await global.ds.fusionGisCrimeService.get(
        `api/GIS/psboundary?ps_id=${query.psId}`
      );
      return res.data;
    } else {
      throw new BadRequestErr("Required parameters not sent");
    }
  } catch (err) {
    throw err;
  }
}

async function getBeatRoute(body) {
  try {
    const { points } = body;
    const reqBody = {
      elevation: false,
      points: points,
      vehicle: "car",
      type: "json",
      points_encoded: false,
    };
    console.log(reqBody);
    if (points) {
      const res = await global.ds.routeGisService.post(`route`, reqBody);
      return res.data;
    } else {
      throw new BadRequestErr("Required parameters not sent");
    }
  } catch (err) {
    throw err;
  }
}

async function getRecommendedBeatPoints(body) {
  try {
    const { ps_id, sector_ids } = body;
    if (ps_id && sector_ids) {
      const res = await global.ds.recomendedBeatPointGisService.post(
        `api/beatpoint/getbeatpointforps`,
        { ps_id, sector_ids }
      );
      return res.data;
    } else {
      throw new BadRequestErr("Required parameters not sent");
    }
  } catch (err) {
    throw err;
  }
}

async function getPsPvMapById(payload) {
  try {
    const result = await beatPlanModel.getPsPvMapById(payload);
    map(result, async (obj) => {
      obj.police_station = obj.police_station_data[0];
      delete obj.police_station_data;
    });
    const vehicleData = await beatPlanModel.getVehicleById(
      result[0].f_vehicle_id
    );
    result[0].vehicle = vehicleData.length ? vehicleData[0] : null;
    return result;
  } catch (err) {
    throw err;
  }
}

async function getRoute(payload) {
  try {
    return await beatPlanModel.getRoute(payload);
  } catch (err) {
    throw err;
  }
}

async function checkAssignedPatrolRoute(payload) {
  try {
    return await beatPlanModel.checkAssignedPatrolRoute(payload);
  } catch (err) {
    throw err;
  }
}

async function postUserMapping(payload) {
  try {
    const dayWiseData = await beatPlanModel.postUserMapping(payload);
    var f_day_wise_beat_ids = [];
    var f_day_wise_beat_ids_total = [];
    map(dayWiseData, (item) => {
      if (item.f_beat_status == 2) {
        f_day_wise_beat_ids.push(item.id);
      }
      f_day_wise_beat_ids_total.push(item.id);
    });
    payload.f_day_wise_beat_ids = f_day_wise_beat_ids;
    payload.f_day_wise_beat_ids_total = f_day_wise_beat_ids_total;
    return await beatPlanModel.insertMappingData(payload);
  } catch (err) {
    throw err;
  }
}

async function userDayWiseMapping(payload) {
  try {
    const beatDataList = [];
    const userDaywiseMapping = await beatPlanModel.userDayWiseMapping(payload);
    userDaywiseMapping[0].beat_points = [];
    if (
      userDaywiseMapping[0].f_day_wise_beat_ids != null &&
      userDaywiseMapping[0].f_day_wise_beat_ids.length > 0
    ) {
      for (
        var i = 0;
        i < userDaywiseMapping[0].f_day_wise_beat_ids.length;
        i++
      ) {
        const beatData = await getBeatData(
          userDaywiseMapping[0].f_day_wise_beat_ids[i]
        );
        beatDataList.push(beatData);
      }
    }
    map(beatDataList, (item) => {
      map(item, (obj) => {
        let latlng = obj.beat_point[0].f_geo_point.slice(1, -1);
        obj.beat_point[0].f_geo_point = {};
        obj.beat_point[0].f_geo_point.lng = latlng.split(",")[0];
        obj.beat_point[0].f_geo_point.lat = latlng.split(",")[1];
        obj.beat_point_master[0].beat_point = obj.beat_point[0];
        delete obj.beat_point;
        obj.beat_point_master = obj.beat_point_master[0];
        userDaywiseMapping[0].beat_points.push(obj);
      });
    });
    return userDaywiseMapping[0];
  } catch (err) {
    throw err;
  }
}

async function getBeatData(f_day_wise_beat_id) {
  return await beatPlanModel.getBeatData(f_day_wise_beat_id);
}

async function addCoOfficer(payload) {
  try {
    return await beatPlanModel.addCoOfficer(payload);
  } catch (err) {
    throw err;
  }
}

async function updateDaywiseBeatMapping(payload) {
  try {
    var bodyparameters = {};
    bodyparameters.f_updated_on = new Date();
    if (payload.f_user_id) {
      bodyparameters.f_user_id = payload.f_user_id;
    }
    if (payload.f_co_user_id) {
      bodyparameters.f_co_user_id = payload.f_co_user_id;
    }
    if (payload.f_day_wise_beat_ids.length > 0) {
      bodyparameters.f_day_wise_beat_ids =
        "{" + payload.f_day_wise_beat_ids + "}";
    }
    if (payload.f_start_date_time) {
      bodyparameters.f_start_date_time = payload.f_start_date_time;
    }
    if (payload.f_end_date_time) {
      bodyparameters.f_end_date_time = payload.f_end_date_time;
    }
    if (payload.f_shift_hours) {
      bodyparameters.f_shift_hours = payload.f_shift_hours;
    }
    if (payload.f_updated_by) {
      bodyparameters.f_updated_by = payload.f_updated_by;
    } else {
      bodyparameters.f_updated_by = 0;
    }
    if(payload.km_travelled){
      bodyparameters.km_travelled = payload.km_travelled;
    } else {
      bodyparameters.km_travelled = "";
    }
    if(payload.beat_status){
      bodyparameters.beat_status = payload.beat_status;
    } else {
      bodyparameters.beat_status = "";
    }
    if(payload.overall_status){
      bodyparameters.overall_status = payload.overall_status;
    } else {
      bodyparameters.overall_status = "";
    }
    if(payload.f_total_beat_distance){
      bodyparameters.f_total_beat_distance = payload.f_total_beat_distance;
    } else {
      bodyparameters.f_total_beat_distance = "";
    }
    return await beatPlanModel.updateDaywiseBeatMapping(
      payload,
      bodyparameters
    );
  } catch (err) {
    throw err;
  }
}

async function beatPoints(payload) {
  try {
    const res = await beatPlanModel.beatPoints(payload);
    map(res, (obj) => {
      obj.f_geo_point = renameKey(obj.f_geo_point, "x", "lng");
      obj.f_geo_point = renameKey(obj.f_geo_point, "y", "lat");
    });
    return res;
  } catch (err) {
    throw err;
  }
}

function renameKey(object, key, newKey) {
  const clonedObj = Object.assign({}, object);
  const targetKey = clonedObj[key];
  delete clonedObj[key];
  clonedObj[newKey] = targetKey;
  return clonedObj;
}

async function coFieldOfficersList(payload) {
  try {
    const result = await beatPlanModel.coFieldOfficersList(payload);
    for (var i = 0; i < result.length; i++) {
      let found = false;
      result[i].roles.some((item) => {
        if (item && item.f_role_id === "FIELD OFFICER") {
          found = true;
        }
      });
      if (!found) {
        result[i].roles = [];
        delete result[i].activity;
      } else {
        result[i].roles[0].activities = result[i].activity;
        delete result[i].activity;
      }
    }
    return result;
  } catch (err) {
    throw err;
  }
}

async function getBeatPointsList(payload) {
  try {
    const res = await beatPlanModel.getBeatPointsList(payload);
    map(res, (obj) => {
      obj.beat_point = obj.beatpoints[0];
      let latlng = obj.beat_point.f_geo_point.slice(1, -1);
      obj.beat_point.f_geo_point = {
        lng: latlng.split(",")[0],
        lat: latlng.split(",")[1],
      };
      delete obj.beatpoints;
    });
    return res;
  } catch (err) {
    throw err;
  }
}
async function getBeatPointRouting(payload) {
  try {
    const { points } = payload;
    const reqBody = {
      locations: points,
      costing: "auto",
      directions_options: {
        units: "kilometers",
      },
    };
    if (points) {
      const res = await axios.post(
        `${global.ds.valhallaServer.defaults.baseURL}/optimized_route`,
        reqBody
      );
      return res.data;
    } else {
      throw new BadRequestErr("required parameters missing");
    }
  } catch (err) {
    throw err;
  }
}

async function updateBeatPlanMaster(payload) {
  try {
    if (!payload.psPvId) {
      return await beatPlanModel.createBeatPlanMaster(payload);
    } else {
      return await beatPlanModel.updateBeatPlanMaster(payload);
    }
  } catch (err) {
    throw err;
  }
}
async function getPsPvMap(payload){
  try {
    const result = await beatPlanModel.getPsPvMap(payload);
    for(var i=0; i<result.length; i++){
      result[i].police_station = result[i].police_station_data[0];
      delete result[i].police_station_data;
      const vehicleData = await beatPlanModel.getVehicleById(result[i].f_vehicle_id);
      result[i].vehicle = vehicleData.length ? vehicleData[0] : null;
    }
    return result;
  } catch (err) {
    throw err;
  }
}
module.exports = {
  getSectorsData,
  getBoundaryData,
  getBeatRoute,
  getRecommendedBeatPoints,
  getPsPvMapById,
  getRoute,
  checkAssignedPatrolRoute,
  postUserMapping,
  userDayWiseMapping,
  addCoOfficer,
  updateDaywiseBeatMapping,
  beatPoints,
  coFieldOfficersList,
  getBeatPointsList,
  getBeatPointRouting,
  updateBeatPlanMaster,
  getPsPvMap
};
