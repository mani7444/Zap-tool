"use strict";

const beatOftheDayModel = require("../../models/v1/beat-of-the-day-model");
const { keyBy, map } = require("lodash");

async function getBeatOftheDay(payload){
    try {
        const result = await beatOftheDayModel.getBeatOftheDay(payload);
        map(result, (obj) => {
            let latlng = obj.beat_point[0].f_geo_point.slice(1,-1);
            obj.beat_point[0].f_geo_point = {};
            obj.beat_point[0].f_geo_point.lng = latlng.split(",")[0];
            obj.beat_point[0].f_geo_point.lat = latlng.split(",")[1];
            obj.json_agg[0].beat_point = obj.beat_point[0];
            delete obj.beat_point;
            obj.beat_point_master = obj.json_agg[0];
            delete obj.json_agg;
            if(obj.beat_point_master.f_patrol_beat_end_time != ""){
                var currentDate = formatDate();
                var fullDate = currentDate + " " + obj.beat_point_master.f_patrol_beat_end_time;
                obj.beat_point_master.f_patrol_beat_end_time = fullDate;
            }
            if(obj.beat_point_master.f_patrol_beat_start_time != ""){
                var currentDate = formatDate();
                var fullDate = currentDate + " " + obj.beat_point_master.f_patrol_beat_start_time;
                obj.beat_point_master.f_patrol_beat_start_time = fullDate;
            }
        });
        return result;
    } catch (err) {
        throw err;
    }
}

function formatDate() {
    var d = new Date(),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
}

module.exports = {
    getBeatOftheDay
};