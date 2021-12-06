"use strict";

const listToTree = (arr = []) => {
  if (!arr.length) return [];
  let map = {},
    node,
    res = [],
    i = 0;
  while (arr.length > i) {
    map[arr[i].value] = i;
    arr[i].children = [];
    node = arr[i];
    if (node.parent_id) {
      arr[map[node.parent_id]].children.push({
        value: node.value,
        label: node.label,
        children: node.children,
        f_entity_mapping_id: node.f_entity_mapping_id,
      });
    } else {
      res.push({
        value: node.value,
        label: node.label,
        children: node.children,
        f_entity_mapping_id: node.f_entity_mapping_id,
      });
    }
    i += 1;
  }
  return res;
};

const searchTree = (tree, key, value) => {
  const stack = [tree];
  while (stack.length) {
    const node = stack.shift();
    if (node[key] === value) return [node];
    node.children && stack.push(...node.children);
  }
  return [];
};

const searchTreeChildren = (tree) => {
  const stack = [tree];
  const children = [];
  while (stack.length) {
    const node = stack.shift();
    children.push(node.value);
    node.children && stack.push(...node.children);
  }
  return children;
};

const storeNBData = async (incident) => {
  try {
    const { f_object, f_status_id, f_geo_point, f_created_on, f_updated_on } =
      incident;
    if (
      f_object &&
      f_object.ambulanceData &&
      f_status_id &&
      (f_status_id === 4 || f_status_id === 5) &&
      !f_object.ambulanceData.recommendedRoute &&
      !f_object.ambulanceData.travelHistory
    ) {
      let ambulanceData = f_object.ambulanceData.details;
      let routeBodyParams = {
        origin: `${ambulanceData.currentlocation.lat},${ambulanceData.currentlocation.lng}`,
        destination: `${f_geo_point.lat},${f_geo_point.lng}`,
        key: "lnttesting",
        special_object_types: "traffic_signals",
      };
      let incidentBody = { f_object: { ...f_object } };
      const routeData = await global.ds.serviceHandler.post(
        "api/fusion-mers-service/route",
        routeBodyParams
      );
      if (routeData && routeData.data && routeData.data.payload) {
        incidentBody.f_object.ambulanceData.recommendedRoute = {};
        incidentBody.f_object.ambulanceData.recommendedRoute =
          routeData.data.payload;
      }
      let startTime = Math.round(Date.parse(f_created_on) / 1000);
      let endTime = Math.round(Date.parse(f_updated_on) / 1000);
      let travelHistoryParams = {
        servicetype: "ambulance",
        ambulanceId: f_object.ambulanceData.id,
        startTime: startTime,
        endTime: endTime,
        special_object_types: ["traffic_signals"],
        key: "lnttesting",
      };
      try {
        const historyData = await global.ds.serviceHandler.post(
          "api/fusion-mers-service/post-route-history",
          travelHistoryParams
        );
        if (historyData && historyData.data && historyData.data.payload.route) {
          incidentBody.f_object.ambulanceData.travelHistory = {};
          incidentBody.f_object.ambulanceData.travelHistory = data.data;
        }
      } catch (err) {
        //global.logger.error(err);
      } finally {
        return incidentBody;
      }
    }
  } catch (err) {
    //global.logger.error(err);
  }
};

module.exports = {
  listToTree,
  searchTree,
  searchTreeChildren,
  storeNBData,
};
