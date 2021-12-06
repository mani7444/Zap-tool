"use strict";

const dayWiseBeatModel = require("../../models/v1/day-wise-beat-model");
const { keyBy, map } = require("lodash");

async function addDayWiseBeatPointId(payload) {
  try {
    return await dayWiseBeatModel.addDayWiseBeatPointId(payload);
  } catch (err) {
    throw err;
  }
}

async function getDaywiseBeatLog(query) {
  try {
    if(query.id){
      const logData = await dayWiseBeatModel.getDaywiseBeatLogById(parseInt(query.id));
      map(logData, (obj) => {
        obj.f_beat_geo_point.lng = obj.f_beat_geo_point.x;
        obj.f_beat_geo_point.lat = obj.f_beat_geo_point.y;
        delete obj.f_beat_geo_point.x;
        delete obj.f_beat_geo_point.y;
      });
      return logData;
    } else{
      const logsData = await dayWiseBeatModel.getDaywiseBeatLog();
      map(logsData, (obj) => {
        obj.f_beat_geo_point.lng = obj.f_beat_geo_point.x;
        obj.f_beat_geo_point.lat = obj.f_beat_geo_point.y;
        delete obj.f_beat_geo_point.x;
        delete obj.f_beat_geo_point.y;
      });
      return logsData;
    }
  } catch (err) {
    throw err;
  }
}

async function updateDayWiseBeats(payload){
  try {
    const res = await dayWiseBeatModel.updateDayWiseBeats(payload);
    if(res.length){
      const beatList = await dayWiseBeatModel.getBeatList(res[0].f_beat_plan_master_id);
      if(beatList.length){
        beatList[0].beat_point = beatList[0].beatpoints[0];
        delete beatList[0].beatpoints;
        let latlng = beatList[0].beat_point.f_geo_point.slice(1,-1);
        beatList[0].beat_point.f_geo_point = {lng: latlng.split(",")[0], lat: latlng.split(",")[1]};
      }
      res[0].beat_point_master = beatList[0];
    }
    return res;
  } catch (err) {
    throw err;
  }
}


module.exports = {
  addDayWiseBeatPointId,
  getDaywiseBeatLog,
  updateDayWiseBeats
};
