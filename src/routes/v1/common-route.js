"use strict";

const { Response, BadRequestErr } = require("fusion-http-response");
const commonService = require("../../services/v1/common-service");
const {
  updateIncidentReportValidator,
} = require("../../validators/common-services-validators");
const { uploadFiles } = require("../../helpers/file-upload-helper");
async function getIncidentActions(req, res) {
  let response = new Response();
  try {
    response.payload = await commonService.getIncidentActions();
  } catch (err) {
    response = err;
    global.logger.error(err);
  } finally {
    res.status(response.status || 500).json(response);
  }
}

async function getIncidentTypes(req, res) {
  let response = new Response();
  try {
    response.payload = await commonService.getIncidentTypes();
  } catch (err) {
    response = err;
    global.logger.error(err);
  } finally {
    res.status(response.status || 500).json(response);
  }
}
async function getIncidentSubTypes(req, res) {
  let response = new Response();
  try {
    response.payload = await commonService.getIncidentSubTypes();
  } catch (err) {
    response = err;
    global.logger.error(err);
  } finally {
    res.status(response.status || 500).json(response);
  }
}
async function getListOfStatus(req, res) {
  let response = new Response();
  try {
    response.payload = await commonService.getListOfStatus(req.query);
  } catch (err) {
    response = err;
    global.logger.error(err);
  } finally {
    res.status(response.status || 500).json(response);
  }
}

async function updateIncidentReportById(req, res) {
  let response = new Response();
  try {
    const { body } = req;
    const errors = updateIncidentReportValidator(body);
    if (errors.length) throw new BadRequestErr(errors[0].message);
    response.payload = await commonService.updateIncidentReportById(body);
  } catch (err) {
    response = err;
    global.logger.error(err);
  } finally {
    res.status(response.status || 500).json(response);
  }
}
async function updateFieldOfficerStatus(req, res) {
  let response = new Response();
  try {
    const { body } = req;
    if (!body.id) {
      throw new BadRequestErr("Required parameters are missing");
    }
    response.payload = await commonService.updateFieldOfficerStatus(body);
  } catch (err) {
    response = err;
    global.logger.error(err);
  } finally {
    res.status(response.status || 500).json(response);
  }
}
async function incidentListByUserId(req, res) {
  let response = new Response();
  let data = {};
  try {
    const { body } = req;
    response.payload = await commonService.incidentListByUserId(body);
    response.payload.totalCount = parseInt(
      response.payload.totalCount[0].count
    );
  } catch (err) {
    response = err;
    global.logger.error(err);
  } finally {
    res.status(response.status || 500).json(response);
  }
}

async function login(req, res) {
  let response = new Response();
  try {
    const { body } = req;
    response.payload = await commonService.login(body);
  } catch (err) {
    response = err;
    global.logger.error(err);
  } finally {
    res.status(response.status || 500).json(response);
  }
}
async function incidentCreate(req, res) {
  let response = new Response();
  try {
    const { body } = req;
    response.payload = await commonService.incidentCreate(body);
  } catch (err) {
    response = err;
    global.logger.error(err);
  } finally {
    res.status(response.status || 500).json(response);
  }
}
async function gisRoute(req, res) {
  let response = new Response();
  try {
    response.payload = await commonService.gisRoute(req);
  } catch (err) {
    response = err;
    global.logger.error(err);
  } finally {
    res.status(response.status || 500).json(response);
  }
}
async function gisNavigate(req, res) {
  let response = new Response();
  try {
    response.payload = await commonService.gisNavigate(req);
  } catch (err) {
    response = err;
    global.logger.error(err);
  } finally {
    res.status(response.status || 500).json(response.payload);
  }
}
async function policeStations(req, res) {
  let response = new Response();
  try {
    response.payload = await commonService.policeStations(req.query);
  } catch (err) {
    response = err;
    global.logger.error(err);
  } finally {
    res.status(response.status || 500).json(response);
  }
}
async function updateTokenForUser(req, res) {
  let response = new Response();
  try {
    const { body } = req;
    if (!body.id) throw new BadRequestErr("id is missing.");
    response.payload = await commonService.updateTokenForUser(body);
    delete response.payload;
  } catch (err) {
    response = err;
    global.logger.error(err);
  } finally {
    res.status(response.status || 500).json(response);
  }
}
async function getUserDataByEntityId(req, res) {
  let response = new Response();
  try {
    const { body } = req;
    if (!body.entityId) throw new BadRequestErr("Entity id is missing.");
    response.payload = await commonService.getUserDataByEntityId(body);
  } catch (err) {
    response = err;
    global.logger.error(err);
  } finally {
    res.status(response.status || 500).json(response);
  }
}
async function getVehiclesDataByDevice(req, res) {
  let response = new Response();
  try {
    const { body } = req;
    if (!body.deviceId) throw new BadRequestErr("devcie id is missing.");
    response.payload = await commonService.getVehiclesDataByDevice(
      body.deviceId
    );
  } catch (err) {
    response = err;
    global.logger.error(err);
  } finally {
    res.status(response.status || 500).json(response);
  }
}
async function updateIncident(req, res) {
  let response = new Response();
  try {
    const { body } = req;
    response.payload = await commonService.updateIncident(body);
  } catch (err) {
    response = err;
    global.logger.error(err);
  } finally {
    res.status(response.status || 500).json(response);
  }
}
async function snapToRoad(req, res) {
  let response = new Response();
  try {
    const { body } = req;
    response.payload = await commonService.snapToRoad(body);
  } catch (err) {
    response = err;
    global.logger.error(err);
  } finally {
    res.status(response.status || 500).json(response);
  }
}
async function upload(req, res) {
  let response = new Response();
  try {
    await uploadFiles()(req, res);
    if (!req.files)
      throw new BadRequestErr("Please send required parameters.");
    var fileInfo = req.files[0];  
    let attachmentBody = {
      f_name: fileInfo.filename,
      f_container : 'incidents',
      f_url: `/uploads/incidents/images/${fileInfo.filename}`,
      f_incident_id : parseInt(req.params.id),
      f_created_on: new Date(),
      f_updated_on: new Date(),
      f_created_by: 1,
      f_updated_by: 1
    };
    response.payload = await commonService.upload(attachmentBody);
  } catch (err) {
    response = err;
  } finally {
    res.status(response.status || 500).json(response);
  }
}
async function assignFieldOfficer(req, res) {
  let response = new Response();
  try {
    const { body } = req;
    response.payload = await commonService.assignFieldOfficer(body);
  } catch (err) {
    response = err;
    global.logger.error(err);
  } finally {
    res.status(response.status || 500).json(response);
  }
}
async function getVehiclesByPs(req, res) {
  let response = new Response();
  try {
    const { body } = req;
    if(!body.psId) throw new BadRequestErr("Please send required parameters.");
    response.payload = await commonService.getVehiclesByPs(body);
  } catch (err) {
    response = err;
    global.logger.error(err);
  } finally {
    res.status(response.status || 500).json(response);
  }
}
async function reverseGeoCoding(req, res) {
  let response = new Response();
  try {
    const { body } = req;
    const {lat, lng} = body;
    response.payload = await commonService.getLocation(lat, lng);
  } catch (err) {
    response = err;
    global.logger.error(err);
  } finally {
    res.status(response.status || 500).json(response);
  }
}
async function gisLocationSearch(req, res) {
  let response = new Response();
  try {
    response.payload = await commonService.gisLocationSearch(req.query);
  } catch (err) {
    response = err;
    global.logger.error(err);
  } finally {
    res.status(response.status || 500).json(response);
  }
}
module.exports = {
  getIncidentActions,
  getIncidentTypes,
  getIncidentSubTypes,
  getListOfStatus,
  updateIncidentReportById,
  updateFieldOfficerStatus,
  incidentListByUserId,
  login,
  incidentCreate,
  gisRoute,
  gisNavigate,
  policeStations,
  updateTokenForUser,
  getUserDataByEntityId,
  getVehiclesDataByDevice,
  updateIncident,
  snapToRoad,
  upload,
  assignFieldOfficer,
  getVehiclesByPs,
  reverseGeoCoding,
  gisLocationSearch
};
