"use strict";

const { Response, BadRequestErr } = require("fusion-http-response");
const beatPlanService = require("../../services/v1/beat-plan-service");
const { beatRouteValidator } = require("../../validators/beat-route-validator");
const {
  recommendedBeatPointValidator,
} = require("../../validators/recommended-beat-point-validator");
const {
  getPsPvByIdValidator,
  routeValidator,
  checkAssignedPatrolRouteValidator,
  postUserMappingValidator,
  userDayWiseMappingValidator,
  addCoOfficerValidator,
  beatPointsValidator,
  coFieldOfficersValidator,
  beatPointListValidator
} = require("../../validators/patrol-services-validators");

async function getSectors(req, res) {
  let response = new Response();
  try {
    response.payload = await beatPlanService.getSectorsData(req.query);
  } catch (err) {
    response = err;
  } finally {
    res.status(response.status || 500).json(response);
  }
}

async function getBoundary(req, res) {
  let response = new Response();
  try {
    response.payload = await beatPlanService.getBoundaryData(req.query);
  } catch (err) {
    response = err;
    global.logger.error(err);
  } finally {
    res.status(response.status || 500).json(response);
  }
}

async function getBeatRoute(req, res) {
  let response = new Response();
  try {
    const { body } = req;
    const errors = beatRouteValidator(body);
    if (errors.length) throw new BadRequestErr(errors[0].message);
    response.payload = await beatPlanService.getBeatRoute(body);
  } catch (err) {
    response = err;
    global.logger.error(err);
  } finally {
    res.status(response.status || 500).json(response);
  }
}

async function getRecommendedBeatPoints(req, res) {
  let response = new Response();
  try {
    const { body } = req;
    const errors = recommendedBeatPointValidator(body);
    if (errors.length) throw new BadRequestErr(errors[0].message);
    response.payload = await beatPlanService.getRecommendedBeatPoints(body);
  } catch (err) {
    response = err;
    global.logger.error(err);
  } finally {
    res.status(response.status || 500).json(response);
  }
}

async function getPsPvMapById(req, res) {
  let response = new Response();
  try {
    const { body } = req;
    const errors = getPsPvByIdValidator(body);
    if (errors.length) throw new BadRequestErr(errors[0].message);
    response.payload = await beatPlanService.getPsPvMapById(body);
  } catch (err) {
    response = err;
    global.logger.error(err);
  } finally {
    res.status(response.status || 500).json(response);
  }
}

async function getRoute(req, res) {
  let response = new Response();
  try {
    const { body } = req;
    const errors = routeValidator(body);
    if (errors.length) throw new BadRequestErr(errors[0].message);
    response.payload = await beatPlanService.getRoute(body);
  } catch (err) {
    response = err;
    global.logger.error(err);
  } finally {
    res.status(response.status || 500).json(response);
  }
}

async function checkAssignedPatrolRoute(req, res) {
  let response = new Response();
  try {
    const { body } = req;
    const errors = checkAssignedPatrolRouteValidator(body);
    if (errors.length) throw new BadRequestErr(errors[0].message);
    response.payload = await beatPlanService.checkAssignedPatrolRoute(body);
  } catch (err) {
    response = err;
    global.logger.error(err);
  } finally {
    res.status(response.status || 500).json(response);
  }
}

async function postUserMapping(req, res) {
  let response = new Response();
  try {
    const { body } = req;
    const errors = postUserMappingValidator(body);
    if (errors.length) throw new BadRequestErr(errors[0].message);
    response.payload = await beatPlanService.postUserMapping(body);
  } catch (err) {
    response = err;
    global.logger.error(err);
  } finally {
    res.status(response.status || 500).json(response);
  }
}

async function userDayWiseMapping(req, res) {
  let response = new Response();
  try {
    const { body } = req;
    const errors = userDayWiseMappingValidator(body);
    if (errors.length) throw new BadRequestErr(errors[0].message);
    response.payload = await beatPlanService.userDayWiseMapping(body);
  } catch (err) {
    response = err;
    global.logger.error(err);
  } finally {
    res.status(response.status || 500).json(response);
  }
}

async function addCoOfficer(req, res) {
  let response = new Response();
  try {
    const { body } = req;
    const errors = addCoOfficerValidator(body);
    if (errors.length) throw new BadRequestErr(errors[0].message);
    response.payload = await beatPlanService.addCoOfficer(body);
  } catch (err) {
    response = err;
    global.logger.error(err);
  } finally {
    res.status(response.status || 500).json(response);
  }
}

async function updateDaywiseBeatMapping(req, res) {
  let response = new Response();
  try {
    const { body } = req;
    if (!body.updateBody.id)
      throw new BadRequestErr("Please check input parameter..!!!");
    response.payload = await beatPlanService.updateDaywiseBeatMapping(body.updateBody);
  } catch (err) {
    response = err;
    global.logger.error(err);
  } finally {
    res.status(response.status || 500).json(response);
  }
}

async function beatPoints(req, res) {
  let response = new Response();
  try {
    const { body } = req;
    const errors = beatPointsValidator(body);
    if (errors.length) throw new BadRequestErr(errors[0].message);
    var geo_point_lng = body.lng;
    var geo_point_lat = body.lat;
    body.f_geo_point = [geo_point_lng, geo_point_lat].toString();
    body.f_created_on = new Date();
    body.f_updated_on = new Date();
    body.f_created_by = 1;
    body.f_updated_by = 1;
    delete body.lng;
    delete body.lat;
    response.payload = await beatPlanService.beatPoints(body);
  } catch (err) {
    response = err;
    global.logger.error(err);
  } finally {
    res.status(response.status || 500).json(response);
  }
}

async function coFieldOfficersList(req, res) {
  let response = new Response();
  try {
    const { body } = req;
    const errors = coFieldOfficersValidator(body);
    if (errors.length) throw new BadRequestErr(errors[0].message);
    response.payload = await beatPlanService.coFieldOfficersList(body);
  } catch (err) {
    response = err;
    global.logger.error(err);
  } finally {
    res.status(response.status || 500).json(response);
  }
}
async function getBeatPointsList(req, res) {
  let response = new Response();
  try {
    const { body } = req;
    const errors = beatPointListValidator(body);
    if (errors.length) throw new BadRequestErr(errors[0].message);
    response.payload = await beatPlanService.getBeatPointsList(body);
  } catch (err) {
    response = err;
    global.logger.error(err);
  } finally {
    res.status(response.status || 500).json(response);
  }
}
async function getBeatPointRouting(req, res) {
  let response = new Response();
  try {
    const { body } = req;
    response.payload = await beatPlanService.getBeatPointRouting(body);
  } catch (err) {
    response = err;
    global.logger.error(err);
  } finally {
    res.status(response.status || 500).json(response);
  }
}
async function updateBeatPlanMaster(req, res) {
  let response = new Response();
  try {
    const { body } = req;
    response.payload = await beatPlanService.updateBeatPlanMaster(body);
  } catch (err) {
    response = err;
    global.logger.error(err);
  } finally {
    res.status(response.status || 500).json(response);
  }
}
async function getPsPvMap(req, res) {
  let response = new Response();
  try {
    response.payload = await beatPlanService.getPsPvMap(req);
  } catch (err) {
    response = err;
    global.logger.error(err);
  } finally {
    res.status(response.status || 500).json(response);
  }
}
module.exports = {
  getSectors,
  getBoundary,
  getBeatRoute,
  getRecommendedBeatPoints,
  getPsPvMapById,
  getRoute,
  checkAssignedPatrolRoute,
  postUserMapping,
  userDayWiseMapping,
  addCoOfficer,
  updateDaywiseBeatMapping,
  beatPoints,
  coFieldOfficersList,
  getBeatPointsList,
  getBeatPointRouting,
  updateBeatPlanMaster,
  getPsPvMap
};
