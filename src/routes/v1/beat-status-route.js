"use strict";

const { Response, BadRequestErr } = require("fusion-http-response");
const beatStatusService = require("../../services/v1/beat-status-service");
const {beatStatusValidator} = require("../../validators/beat-status-validator");
async function liveVechicleData(req, res) {
  let response = new Response();
  try {
    const { body } = req;
    response.payload = await beatStatusService.liveVechicleData(body);
    return response;
  } catch (err) {
    response = err;
    throw err;
  } finally {
    res.status(response.status || 500).json(response);
  }
}

async function getBeatStatus(req, res) {
    let response = new Response();
    try {
      const {body} = req;
      const errors = beatStatusValidator(body);
      if(errors.length) throw new BadRequestErr(errors[0].message);
      response.payload = await beatStatusService.getBeatStatus(body);
      return response;
    } catch (err) {
      response = err;
    } finally {
      res.status(response.status || 500).json(response);
    }
  }

module.exports = {
  liveVechicleData,
  getBeatStatus
};
