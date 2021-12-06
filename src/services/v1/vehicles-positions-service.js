"use strict";
const VehiclesPostionsModel  =  require("../../models/v1/vehicles-positions-model");


async function getVehiclePositions() {
    try {
      let vehiclePositions = await VehiclesPostionsModel.getVehiclePositions();
      return vehiclePositions;
    } catch (err) {
      global.logger.error(err);
      throw new err;
    }
  }
  
module.exports = {
    getVehiclePositions
};
  