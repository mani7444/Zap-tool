"use strict";

const { Response, BadRequestErr } = require("fusion-http-response");
const beatPointService = require("../../services/v1/beat-point-servcie");
const { keyBy, map } = require("lodash");

async function updateBeatPoints(req, res) {
  let response = new Response();
  try {
    const { body } = req;
    response.payload = await beatPointService.updateBeatPoints(body);
  } catch (err) {
    response = err;
    global.logger.error(err);
  } finally {
    res.status(response.status || 500).json(response);
  }
}

module.exports = {
  updateBeatPoints,
};
