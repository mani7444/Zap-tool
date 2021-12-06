"use strict";

const { Response, BadRequestErr } = require("fusion-http-response");
const beatPointModel = require("../../models/v1/beat-point-model");
const { keyBy, map } = require("lodash");

async function updateBeatPoints(payload = []) {
  try {
    let saveBeatPoint = [];
    payload.forEach((option) => {
      saveBeatPoint.push({
        f_beat_name: option.f_beat_name,
        f_geo_point: [option.f_geo_point.lng, option.f_geo_point.lat].toString(),
        f_created_on: new Date(),
        f_updated_on: new Date(),
        f_created_by: option.f_created_by,
        f_updated_by: option.f_updated_by
      })
    });
    const beatPoints = await beatPointModel.updateBeatPoints(saveBeatPoint);
    let beatMasterReqBody = [];
    if(beatPoints.length){
      for(let i=0; i<beatPoints.length; i++){
          beatMasterReqBody.push({
            f_patrol_beat_start_time: payload[i].f_beat_start_time,
            f_patrol_beat_end_time: payload[i].f_beat_end_time,
            f_patrol_beat_time: `${payload[i].f_beat_start_time} - ${payload[i].f_beat_end_time}`,
            f_plan_type: 'A',
            f_beat_point_id: beatPoints[i].id,
            f_ps_pv_map_id: payload[i].f_ps_pv_map_id,
            f_is_active: 1,
            f_sequence: i,
            f_created_on: new Date(),
            f_updated_on: new Date(),
            f_created_by: payload[i].f_created_by,
            f_updated_by: payload[i].f_updated_by
          })
      }
      await beatPointModel.updateBeatPlanMatser(beatMasterReqBody);
    }
    return 'success';
  } catch (err) {
    throw err;
  }
}

module.exports = {
  updateBeatPoints,
};
