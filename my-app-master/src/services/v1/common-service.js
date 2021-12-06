"use strict";

const commonModel = require("../../models/v1/common-model");
const beatPlanServce = require("../../services/v1/beat-plan-service");
const beatPlanModel = require("../../models/v1/beat-plan-model");
var CryptoJS = require("crypto-js");
const axios = require("axios");
const { keyBy, map } = require("lodash");
const { notificationObj } = require("../../constants/cache-constant");
const { storeNBData } = require("../../helpers/common-helper");
const { query } = require("express");

async function getIncidentActions() {
  try {
    return await commonModel.getIncidentActions();
  } catch (err) {
    throw err;
  }
}
async function getIncidentTypes() {
  try {
    return await commonModel.getIncidentTypes();
  } catch (err) {
    throw err;
  }
}
async function getIncidentSubTypes() {
  try {
    return await commonModel.getIncidentSubTypes();
  } catch (err) {
    throw err;
  }
}
async function getListOfStatus(filter) {
  try {
    if (filter.id) return await commonModel.getStatusById(filter.id);
    return await commonModel.getListOfStatus();
  } catch (err) {
    throw err;
  }
}
async function updateIncidentReportById(payload) {
  try {
    return await commonModel.updateIncidentReportById(payload);
  } catch (err) {
    throw err;
  }
}
async function updateFieldOfficerStatus(payload) {
  try {
    return await commonModel.updateFieldOfficerStatus(payload);
  } catch (err) {
    throw err;
  }
}
async function incidentListByUserId(payload) {
  try {
    if (payload.entityId) {
      payload.entities = [];
      const entities = await getChildEntities(payload.entityId);
      if (entities.payload.length) {
        map(entities.payload, (item) => {
          payload.entities.push(item.value);
        });
      } else {
        payload.entities.push(payload.entityId);
      }
    }
    const result = await commonModel.incidentListByUserId(payload);
    map(result.responseData, (obj) => {
      obj.f_geo_point["lng"] = obj.f_geo_point["x"];
      obj.f_geo_point["lat"] = obj.f_geo_point["y"];
      obj.status = obj.incident_status[0];
      obj.incident_type = obj.f_incident_type[0];
      obj.incident_sub_type = obj.f_incident_sub_type[0];
      delete obj.incident_status;
      delete obj.f_incident_type;
      delete obj.f_incident_sub_type;
    });
    return result;
  } catch (err) {
    throw err;
  }
}

async function getChildEntities(entityId) {
  try {
    const { data } = await global.ds.serviceHandler.get(
      `api/fusion-configuration-service/org-entities?type=children&value=${entityId}`
    );
    return data;
  } catch (err) {
    console.error(err.message);
  }
}
async function login(payload) {
  try {
    var username = "";
    var password = "";
    if (payload.data) {
      let decryptData = CryptoJS.enc.Base64.parse(rqst.body.data).toString(
        CryptoJS.enc.Utf8
      );
      decryptData = JSON.parse(decryptData);
      username = decryptData.username;
      password = decryptData.password;
    } else {
      username = payload.username;
      password = payload.password;
    }
    if (username && password) {
      var body_parameters = {
        username: username,
        password: password,
        grant_type: "password",
      };
      let res = [];
      const result = await global.ds.fusionAtlantisService.post(
        `ds/1.0.0/public/token`,
        JSON.stringify(body_parameters)
      );
      if (Object.keys(result).length > 1) {
        const userData = await getUserDetails(username);
        for (var i = 0; i < userData.length; i++) {
          userData[i].roles[0].activities = userData[i].activity;
          delete userData[i].activity;
          if (userData[i].police.length > 0 && userData[i].police[0] != null) {
            userData[i].police_master = userData[i].police[0];
          }
          delete userData[i].police;
        }
        res.push({ response: userData });
        res[0]["access_token"] = result.data.access_token;
        res[0]["tokens"] = result.data;
      }
      return res[0];
    }
  } catch (err) {
    throw err;
  }
}
async function getUserDetails(username) {
  return await commonModel.getUserDetails(username);
}
async function incidentCreate(payload) {
  try {
    const {
      parent_entity_id,
      requesterName,
      assignID,
      phoneNumber,
      lat,
      long,
      severity,
      description,
      incidentTypeId,
      incidentSubTypeId,
      userId,
      status_id,
      incidentSource,
      incident_id,
      f_entity_id,
      dest_long,
      dest_lat,
      f_lat,
      f_long,
      QR_details,
      ambulanceId,
      ambulanceDetails,
      isSOS,
    } = payload;
    var body_parameters = {
      f_name: requesterName,
      f_user: assignID,
      f_contact: phoneNumber,
      f_geo_point: [long, lat].toString(),
      f_severity: severity,
      f_description: description,
      f_incident_type_id: incidentTypeId,
      f_incident_sub_type_id: incidentSubTypeId,
      f_alert_source: userId,
      f_status_id: status_id,
      f_source: incidentSource,
      f_incident_id: incident_id,
      f_created_on: new Date(),
      f_updated_on: new Date(),
    };
    if (!f_entity_id) {
      const { data } = await getEntity(lat, long);
      if (data != undefined) {
        body_parameters["f_entity_id"] = data.payload ? data.payload.id : null;
      } else {
        body_parameters["f_entity_id"] = null;
      }
    } else {
      body_parameters["f_entity_id"] = f_entity_id;
    }
    if (dest_long && dest_lat) {
      body_parameters["f_object"] = {
        source_location: { lat: f_lat, lng: f_long },
        destination_location: { lat: dest_lat, lng: dest_long },
      };
    }
    if (QR_details) {
      body_parameters["f_object"]["cab_details"] = QR_details;
    }
    if (
      userId &&
      incidentTypeId &&
      incidentSubTypeId &&
      lat &&
      long &&
      status_id
    ) {
      const data = await getLocation(lat, long);
      if ("display_name" in data) {
        body_parameters["f_location"] = data["display_name"];
      }
      if (ambulanceId) {
        body_parameters["f_status_id"] = status_id;
        body_parameters["f_object"] = {
          ambulanceData: {
            id: ambulanceId,
            details: ambulanceDetails,
          },
        };
      }
      const result = await commonModel.createIncident(body_parameters);
      if (result.length) {
        let incidentID = result[0].id;
        let id_with_type = result[0].f_incident_id + incidentID;
        let incidentObj = { incidentId: incidentID };
        let reqObj = { f_incident_id: id_with_type };
        await commonModel.updateIncidentStatus(incidentObj, reqObj);
        let incidentDetails = result[0];
        incidentDetails.f_incident_id = id_with_type;
        const { f_geo_point, f_incident_id } = incidentDetails;
        f_geo_point["lng"] = f_geo_point["x"];
        delete f_geo_point["x"];
        f_geo_point["lat"] = f_geo_point["y"];
        delete f_geo_point["y"];
        if (ambulanceId) {
          const res = await pushAmbulanceDataToNB(
            ambulanceId,
            ambulanceDetails
          );
        }
        if (parent_entity_id && ambulanceId) {
          const entityObj = {
            entityId: parent_entity_id,
          };
          const data = await getUserDataByEntityId(entityObj);
          if (data.length) {
            const supervisorToken = data[0].f_user_token_id;
            if (supervisorToken != null) {
              var msgBody = `Incident No. - ${id_with_type} is assigned for authorization`;
              const res = await sendNotificationAmbulance(
                incidentDetails,
                supervisorToken,
                msgBody
              );
            }
          }
        }
        const msg = "New Incident [" + incidentID + "] has been received.";
        await storeNotificationToRedis(incidentDetails, msg);
        let lat_long_body = { latitude: lat, longitude: long };
        const vehicle_body = await getNearestPo(lat_long_body);
        let res = vehicle_body.data;
        let deviceId = "";
        let ps_id = "";
        if (
          "inactive_po" in res &&
          "features" in res["inactive_po"] &&
          res["inactive_po"]["features"].length > 0 &&
          "properties" in res["inactive_po"]["features"][0] &&
          "deviceId" in res["inactive_po"]["features"][0]["properties"]
        ) {
          deviceId =
            res["inactive_po"]["features"][0]["properties"]["deviceId"];
        }
        if ("ps" in res && "properties" in res["ps"]) {
          ps_id = res["ps"]["properties"]["ps_id"];
        }
        if (isSOS && deviceId) {
          const vehicleData = await getVehiclesDataByDevice(deviceId);
          let update_body;
          if (vehicleData.length) {
            update_body = {
              incidentId: incidentID,
              officerId: vehicleData.ps_pv_map.id,
              psId: ps_id,
              SOS: true,
            };
          } else {
            update_body = {
              incidentId: incidentID,
              psId: ps_id,
            };
          }
          await updateIncident(update_body);
        } else if (ps_id) {
          let update_body = { incidentId: incidentID, psId: ps_id };
          await updateIncident(update_body);
        }
        return incidentDetails;
      }
    }
  } catch (err) {
    throw err;
  }
}
async function getEntity(lat, long) {
  try {
    return await global.ds.serviceHandler.get(
      `api/fusion-configuration-service/org-entities?lat=${lat}&lon=${long}`
    );
  } catch (err) {
    console.error(err.message);
  }
}
async function getLocation(lat, lng) {
  const { data } = await global.ds.fusionNominatimService.get(
    "reverse?format=json&accept-language=en&lat=" + lat + "&lon=" + lng
  );
  return data;
}
async function pushAmbulanceDataToNB(ambulanceId, ambulanceDeatils) {
  try {
    ambulanceDeatils.ambulance_id = ambulanceId;
    const res = await global.ds.serviceHandler.post(
      "api/fusion-mers-service/location-update",
      ambulanceDeatils
    );
    return res;
  } catch (err) {
    console.error(err.message);
  }
}
async function getNearestPo(lat_long_body) {
  try {
    return await global.ds.fusionGisCrimeService.post(
      "api/GIS/assignnearestpo",
      lat_long_body
    );
  } catch (err) {
    console.error(err.message);
  }
}
async function gisRoute(rqst) {
  try {
    const result = await global.ds.routeGisService.get(
      `route?${rqst._parsedUrl.query}`
    );
    return result.data;
  } catch (err) {
    console.error(err.message);
  }
}
async function gisNavigate(rqst) {
  try {
    let result = await global.ds.routeGisService.get(
      `navigate/${rqst._parsedUrl.query}`
    );
    return result.data;
  } catch (err) {
    console.error(err.message);
  }
}
async function policeStations(payload) {
  try {
    if (!payload.id) {
      return await commonModel.policeStations();
    } else {
      return await commonModel.policeStationById(payload);
    }
  } catch (err) {
    throw err;
  }
}
async function updateTokenForUser(payload) {
  try {
    return await commonModel.updateTokenForUser(payload);
  } catch (err) {
    throw err;
  }
}
async function getUserDataByEntityId(payload) {
  try {
    let userData;
    const result = await commonModel.getUserIdByEntityId(payload);
    if (result.length) {
      var userId = result[0].f_user_id;
      userData = await commonModel.getUserDataByUserId(userId);
    } else {
      userData = [];
    }
    return userData;
  } catch (err) {
    throw err;
  }
}
async function sendNotificationAmbulance(incidentDetails, token, msgBody) {
  let notificationToken = token;
  var today = new Date();
  var time =
    today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  let msg = {
    incident_id: incidentDetails.id,
    reported_by: incidentDetails.f_name ? incidentDetails.f_name : "",
    caller_mobile: incidentDetails.f_contact,
    reported_time: time,
    created_date: new Date(),
    incident_type: "",
    severity: incidentDetails.f_severity || notificationObj.sevirity,
    location: incidentDetails.f_location,
    location_coordinates: `${incidentDetails.f_geo_point.lat},${incidentDetails.f_geo_point.lng}`,
    description: msgBody,
  };
  let notification_body = {
    notificationToken: notificationToken,
    message: msg,
    notificationType: notificationObj.ambulanceType,
  };
  const result = await global.ds.serviceHandler.post(
    "api/fusion-notification-service/send-notification",
    notification_body
  );
  return result;
}
async function getVehiclesDataByDevice(deviceId) {
  try {
    const result = await commonModel.getvehicleDetails(deviceId);
    map(result, (item) => {
      item.police_station = item.psdata[0];
      item.ps_pv_map = item.pspvmap[0];
      delete item.psdata;
      delete item.pspvmap;
    });
    return result;
  } catch (err) {
    throw err;
  }
}
async function updateIncident(payload) {
  try {
    let body_parameters = {};
    let {
      incidentId,
      statusId,
      waypointsObject,
      officerId,
      psId,
      incident,
      ambulanceId,
      ambulanceDeatils,
      token,
    } = payload;
    //Update the incident status...
    if (incidentId && statusId) {
      body_parameters["f_status_id"] = statusId;
      if (waypointsObject)
        body_parameters["f_object"] = JSON.stringify(payload.waypointsObject);
      if (statusId == 2) body_parameters["f_user"] = null;
      const result = await commonModel.updateIncidentStatus(
        payload,
        body_parameters
      );
      if (result.length) {
        let savedIncident = result[0];
        let { id, f_geo_point, f_object, f_status_id, f_user, f_incident_id } =
          savedIncident;
        f_geo_point["lng"] = f_geo_point["x"];
        delete f_geo_point["x"];
        f_geo_point["lat"] = f_geo_point["y"];
        delete f_geo_point["y"];
        //send ambulance notification when supervisor accepted
        if (f_object && f_object.ambulanceData && f_status_id == 1) {
          let token = f_object.ambulanceData.details.properties.token;
          var msgBody = `Incident Id - ${id} , has been authorized by supervisor`;
          const data = await sendNotificationAmbulance(
            savedIncident,
            token,
            msgBody
          );
        }
        //store NB data into incident table
        const data = await storeNBData(savedIncident);
        if (data != undefined)
          await commonModel.updateIncidentStatus(payload, data);
        //store notification data in redis
        const msg =
          "Status has been changed for the Incident [" + f_incident_id + "]";
        await storeNotificationToRedis(savedIncident, msg);
        if (f_user) {
          let reqBody = { id: f_user };
          const res = await beatPlanServce.getPsPvMapById(reqBody);
          if (res.length) {
            let ps_pv_result = res[0];
            if (f_status_id == 5 || f_status_id == 4) {
              let pathBody = {
                id: ps_pv_result.id,
                updateBody: { f_is_active: 0 },
              };
              await commonModel.updateFieldOfficerStatus(pathBody);
            }
            // send incident update notification
            await sendIncidentUpdateNotification(savedIncident, ps_pv_result);
          }
        }
        const statusList = await commonModel.getStatusById(f_status_id);
        savedIncident.status = statusList.length ? statusList[0] : {};
        return savedIncident;
      }
    } else if (incidentId && officerId) {
      body_parameters["f_user"] = officerId;
      body_parameters["f_status_id"] = 1;
      if (psId) {
        body_parameters["f_police_station_id"] = psId;
      }
      let reqBody = { id: officerId };
      const res = await beatPlanServce.getPsPvMapById(reqBody);
      if (res.length) {
        let ps_pv_result = res[0];
        const result = await commonModel.updateIncidentStatus(
          payload,
          body_parameters
        );
        if (result.length) {
          let updatedIncident = result[0];
          const { f_incident_id, f_status_id } = updatedIncident;
          const msg =
            "Patrol Officer has been assigned for the Incident [" +
            f_incident_id +
            "]";
          await storeNotificationToRedis(updatedIncident, msg);
          await sendIncidentUpdateNotification(updatedIncident, ps_pv_result);
          const statusList = await commonModel.getStatusById(f_status_id);
          updatedIncident.status = statusList.length ? statusList[0] : {};
          return updatedIncident;
        }
      }
    } else if (incidentId && psId) {
      body_parameters["f_police_station_id"] = ps_id;
      const result = await commonModel.updateIncidentStatus(
        payload,
        body_parameters
      );
      if (result.length) {
        const statusList = await commonModel.getStatusById(
          result[0].f_status_id
        );
        result[0].status = statusList.length ? statusList[0] : {};
        return result[0];
      }
    }
    // else if (incident && ambulanceId) {
    //   body_parameters["f_status_id"] = 1;
    //   body_parameters["f_object"] = {};
    //   body_parameters["f_object"] = {
    //     ambulanceData: {
    //       id: ambulanceId,
    //       details: ambulanceDeatils,
    //     },
    //   };
    //   sendNotificationAmbulance(incident, token, msg);
    // }
  } catch (err) {
    throw err;
  }
}
async function storeNotificationToRedis(incidentData, msg) {
  try {
    const { f_incident_id, id, f_status_id } = incidentData;
    let webNotificationBody = {
      incidentInfo: {
        message: msg,
        incident_id: id,
        statusId: f_status_id,
        type: f_incident_id.slice(0, 5),
      },
    };
    const res = await global.ds.redis.hsetAsync(
      `${notificationObj.NOTIFICATIONAPP}`,
      `${notificationObj.NOTIFICATIONKEY}`,
      JSON.stringify(webNotificationBody)
    );
    let notification_body = {
      f_notify_msg_content: msg,
      f_incident_id: f_incident_id,
    };
    const data = await global.ds.serviceHandler.post(
      "api/fusion-notification-service/notification",
      notification_body
    );
  } catch (err) {
    throw err;
  }
}
async function sendIncidentUpdateNotification(incidentData, ps_pv_result) {
  const { f_name, id, f_contact, f_location, f_incident_id } = incidentData;
  const {
    vehicle,
    f_ps_id,
    id: psPvId,
    f_notification_token_id,
  } = ps_pv_result;
  var today = new Date();
  var time =
    today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  let msg = {
    reported_by: f_name,
    incident_id: id,
    caller_mobile: f_contact,
    reported_time: time,
    created_date: new Date(),
    incident_type: "SOS",
    severity: "HIGH",
    location: f_location,
    description: "Status has been changed for the incident " + f_incident_id,
  };
  let notification_body = {
    deviceId: vehicle.f_device_id,
    notificationToken: f_notification_token_id,
    psId: f_ps_id,
    selectedVechicleId: psPvId,
    message: msg,
  };
  const res = await global.ds.serviceHandler.post(
    "api/fusion-notification-service/send-notification",
    notification_body
  );
}
async function snapToRoad(payload) {
  try {
    const { lat, lng, id, accuracy } = payload;
    let rqstBody = {
      shape: [
        { lat: lat, lon: lng, type: "break" },
        { lat: lat, lon: lng, type: "break" },
      ],
      search_radius: 150,
      costing: "auto",
      shape_match: "map_snap",
      format: "osrm",
    };
    //console.log(rqstBody);
    //let accurateLoaction;
    let responseData;
    // let result = await axios.post(`${global.ds.valhallaServer.defaults.baseURL}/trace_route`, rqstBody);
    // if(result.data.tracepoints && result.data.tracepoints.length) {
    //   let correctedLocation = result.data.tracepoints[0].location;
    //   accurateLoaction =  {lng: correctedLocation[0], lat: correctedLocation[1]}
    //   responseData = {currentlocation: {lng: correctedLocation[0], lat: correctedLocation[1]}, message: "Corrected Location"};
    // } else {
    //   accurateLoaction =  payload;
    //   responseData = {currentlocation: result.data, location: "Raw Location"};
    // }
    let tracker = await global.ds.tracCarServer.post(
      `?id=${id}&lat=${lat}&lon=${lng}&accuracy=${accuracy}`
    );
    //console.log("tracker res", tracker);
    responseData = {
      currentlocation: { lng: lng, lat: lat },
      message: "Raw Location",
    };
    return responseData;
  } catch (err) {
    throw err;
  }
}
async function upload(payload) {
  try {
    return await commonModel.upload(payload);
  } catch (err) {
    throw err;
  }
}
async function assignFieldOfficer(payload) {
  try {
    return await getNearestPo(lat_long_body);
  } catch (err) {
    console.error(err.message);
  }
}
async function getVehiclesByPs(payload) {
  try {
    let vehicleData;
    let psData = await commonModel.getPoliceStations(payload);
    if (psData.length) {
      vehicleData = await commonModel.getVehcilesByEntity(
        psData[0].f_entity_code
      );
      if (vehicleData.length) {
        for (var i = 0; i < vehicleData.length; i++) {
          const pspvData = await commonModel.getRouteByVechicle(
            vehicleData[i].id
          );
          vehicleData[i].ps_pv_map = pspvData[0];
          vehicleData[i].police_station = psData[0];
        }
      }
    }
    return vehicleData;
  } catch (err) {
    console.error(err.message);
  }
}
async function gisLocationSearch(query) {
  const { data } = await global.ds.fusionNominatimService.get(
    `search?q=${query.name}&format=json&accept-language=en&viewbox=77.9219061756295446%2C16.7442309901680915%2C79.4580811438297587%2C17.8126696980481825&format=json&limit=100&bounded=1`
  );
  return data;
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
  getLocation,
  gisLocationSearch,
};
