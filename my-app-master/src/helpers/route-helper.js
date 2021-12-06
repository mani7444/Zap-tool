"use strict";

const { getOrgEntity } = require("../services/v1/org-entity-service");

const getChildrenIds = async (req) => {
  const { query } = req;
  const filter = { type: "children", value: parseInt(query.f_entity_parent_id) };
  return await getOrgEntity(filter);
};

module.exports = {
  getChildrenIds,
};
