"use strict";

const validator = new (require("fastest-validator"))();
const { BadRequestErr }   = require("fusion-http-response");

const updateIncidentReportValidator = validator.compile({
  f_incident_id: { type: "number" },
  f_commment: { type: "string" },
  f_incident_action_id: { type: "number" },
  f_created_on: { type: "string", default: () => new Date(), optional: true },
  f_updated_on: { type: "string", default: () => new Date(), optional: true },
  f_created_by: { type: "number", optional: true, default: 1 },
  f_updated_by: { type: "number", optional: true, default: 1 },
});

const incidentAttachmentValidator = (req, file, cb) => {
  if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
      req.fileValidationError = 'Only image files are allowed!';
      return cb(new BadRequestErr('Only image files are allowed!'), false);
  }
  cb(null, true);

}
module.exports = {
  updateIncidentReportValidator,
  incidentAttachmentValidator
};
