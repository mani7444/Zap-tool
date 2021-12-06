"use strict";

const { Response, BadRequestErr } = require("fusion-http-response");
const VehiclesPositionsService = require("../../services/v1/vehicles-positions-service");

async function getVehiclePositions(req, res) {
  let response = new Response();
  try {
    response.payload = await VehiclesPositionsService.getVehiclePositions();
    return response;
  } catch (err) {
    response = err;
    global.logger.error(err);
    throw err;
  } finally {
    res.status(response.status || 500).json(response);
  }
}



module.exports = {
    getVehiclePositions
};
