"use strict";
const beatStatusModel = require("../../models/v1/beat-status-model");

async function liveVechicleData(payload) {
  try {
    let vehiclesData = await beatStatusModel.getVehiclesByDevice(payload);
    if(vehiclesData.length){
        const psPvData = await beatStatusModel.getPsPvByVehicle(vehiclesData[0].id);
        if(psPvData.length){
            vehiclesData[0].ps_pv_map = psPvData[0];
        }
    }
    var today = new Date();
    if (!payload.startDate) {
        payload.startDate = today.toISOString().split('T')[0];
        payload.startDate = new Date(payload.startDate)
    }
    if (!payload.endDate) {
        payload.endDate = new Date(payload.startDate)
        payload.endDate.setDate(payload.startDate.getDate() + 1);
    }
    payload.pspvid = vehiclesData[0].ps_pv_map.id;
    let new_date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    if(payload.filterDate){
        new_date = payload.filterDate;
    }
    payload.new_date = new_date;
    const userDayWiseMapping = await beatStatusModel.getUserDayWiseMapping(payload);
    const beatData = await beatStatusModel.getbeatoftheday(payload);
    for(var i=0; i<beatData.length;i++){
        beatData[i].beat_point_master = beatData[i].beatplanmaster[0]
        delete beatData[i].beatplanmaster;
        beatData[i].beat_point_master["beat_point"] = beatData[i].beatpoints[0]
        delete beatData[i].beatpoints;
        let latlng = beatData[i].beat_point_master["beat_point"].f_geo_point.slice(1,-1);
        beatData[i].beat_point_master["beat_point"].f_geo_point = {lng: latlng.split(",")[0], lat: latlng.split(",")[1]};
    }
    return beatData
  } catch (err) {
    throw new err();
  }
}

async function getBeatStatus(payload) {
    try {
      let beatStatus = await beatStatusModel.getBeatStatus(payload);
      if(beatStatus.rows.length){
        for(var i=0; i<beatStatus.rows.length; i++){
            const vehicleData = await beatStatusModel.getVehicleData(beatStatus.rows[i]);
            if(vehicleData.length){
                beatStatus.rows[i].f_device_id = vehicleData[0].f_device_id
                beatStatus.rows[i].f_vehicle_no = vehicleData[0].f_vehicle_no
            }
            const userData = await beatStatusModel.getUserData(beatStatus.rows[i]);
            if(userData.length){
                beatStatus.rows[i].f_first_name = userData[0].f_first_name
                beatStatus.rows[i].f_phone_number = userData[0].f_phone_number
            }
        }
      }
      return beatStatus.rows;
    } catch (err) {
      //global.logger.error(err);
      throw new err();
    }
  }

module.exports = {
  liveVechicleData,
  getBeatStatus
};
