"use strict";

const {SqlErr} = require("fusion-http-response");

async function getBeatOftheDay(payloadObj) {
    try {
        let date = new Date();
        let endDate = new Date(date);
        let startDate = new Date(date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate());
        return await global.ds.pg.db
        .select([
            "f_day_wise_beat.*",
            global.ds.pg.db.context.raw('json_agg(f_beat_plan_master.*)'),
            global.ds.pg.db.context.raw('json_agg(f_beat_point.*) as beat_point')
        ])
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
        .where("f_day_wise_beat.f_ps_pv_map_id", payloadObj.ps_pv_id)
        .whereBetween('f_day_wise_beat.f_beat_date', [startDate, endDate])
        .groupBy('f_day_wise_beat.id');
    } catch (err) {
      throw new SqlErr(err);
    }
}

module.exports = {
    getBeatOftheDay
};
  