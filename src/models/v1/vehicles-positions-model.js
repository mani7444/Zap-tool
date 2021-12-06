"use strict";

async function getVehiclePositions() {
  try {
    let {data} = await global.ds.tracCarServer.get("/api/positions");
    return data;
  } catch (err) {
    global.logger.error(err);
    throw new err;
  }
}

module.exports = {
    getVehiclePositions
};
