"use strict";

const { SqlErr } = require("fusion-http-response");
const { groupBy, keyBy } = require("lodash");
const { getEntityTypeBoundary } = require("../models/v1/entity-boundary-model");

async function getOrgEntityMapping() {
  try {
    return await global.ds.pg.db
      .select(
        "f_organization_entity_mapping.id as f_entity_mapping_id",
        "f_organization_entity_mapping.f_entity_id as value",
        "f_organization_entity_mapping.f_entity_parent_id as parent_id",
        "f_entity.f_entity_name  as label"
      )
      .from("f_organization_entity_mapping")
      .leftJoin(
        "f_entity",
        "f_entity.id",
        "f_organization_entity_mapping.f_entity_id"
      );
  } catch (err) {
    throw new SqlErr(err.message);
  }
}

async function loadEntityData() {
  try {
    // for faster entity-type-boundary
    global.entityBoundaryGByType = await getEntityTypeBoundary();
    global.entityBoundaryGByType = groupBy(
      global.entityBoundaryGByType,
      "f_type_code"
    );

    // for faster org entity tree
    global.orgEntityMappings = await getOrgEntityMapping();
    global.orgEntityMappings = keyBy(global.orgEntityMappings, "value");
  } catch (err) {
    console.error(`[INIT-ERR]: ${err.message}`);
  }
}

module.exports = loadEntityData;
