"use strict";

const { Response, BadRequestErr } = require("fusion-http-response");
const dayWiseBeatService = require("../../services/v1/day-wise-beat-service");
const {addDayWiseBeatMapValidator, updateDaywiseBeatsValidator} = require("../../validators/day-wise-beat-validator");

async function addDayWiseBeatPointId(req, res) {
  let response = new Response();
  try {
    const { body } = req;
    const errors = addDayWiseBeatMapValidator(body);
    if (errors.length) throw new BadRequestErr(errors[0].message);
    var geo_point_lng = body.f_beat_geo_point.lng;
    var geo_point_lat = body.f_beat_geo_point.lat;
    body.f_beat_geo_point = [geo_point_lng, geo_point_lat].toString();
    response.payload = await dayWiseBeatService.addDayWiseBeatPointId(body);
    response.payload = [];
    response.message = "Inserted Sucessfully.";
  } catch (err) {
    response = err;
    global.logger.error(err);
  } finally {
    res.status(response.status || 500).json(response);
  }
}

async function getDaywiseBeatLog(req, res) {
  let response = new Response();
  try {
    response.payload = await dayWiseBeatService.getDaywiseBeatLog(req.query);
  } catch (err) {
    response = err;
    global.logger.error(err);
  } finally {
    res.status(response.status || 500).json(response);
  }
}

async function updateDayWiseBeats(req, res){
  let response = new Response();
  try{
    const { body } = req;
    const errors = updateDaywiseBeatsValidator(body);
    if (errors.length) throw new BadRequestErr(errors[0].message);
    response.payload = await dayWiseBeatService.updateDayWiseBeats(body);
  } catch (err) {
    response = err;
    global.logger.error(err);
  } finally {
    res.status(response.status || 500).json(response);
  }
}


module.exports = {
  addDayWiseBeatPointId,
  getDaywiseBeatLog,
  updateDayWiseBeats
};
