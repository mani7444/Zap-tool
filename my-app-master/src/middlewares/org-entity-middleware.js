"use strict";

const commonHelper = require("../helpers/common-helper");

module.exports = (app) => {
  return app.use((req, res, next) => {
    if (req.query.f_entity_parent_id) {
      const treeList = commonHelper.listToTree(Object.values(global.orgEntityMappings));
      const result = commonHelper.searchTree(
        treeList[0] || {},
        "value",
        parseInt(req.query.f_entity_parent_id)
      );
      req.query.entity_ids = commonHelper.searchTreeChildren(result[0] || {});
    }
    next();
  });
};
