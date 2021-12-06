"use strict";
const multer = require("multer");
const path = require("path");
const util = require("util");
const {
  incidentAttachmentValidator,
} = require("../validators/common-services-validators");
const FILE_IMAGE_UPLOAD_PATH = "./public/uploads/images/incidents";

// Get upload file storage...
const getFileUploadStorage = () => {
  try {
    return multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, FILE_IMAGE_UPLOAD_PATH);
      },
      filename: function (req, file, cb) {
        cb(
          null,
          file.fieldname + "-" + Date.now() + path.extname(file.originalname)
        );
      },
    });
  } catch (err) {
    console.log(err);
    throw err;
  }
};

const uploadFiles = () => {
  const storage = getFileUploadStorage();
  return util.promisify(
    multer({ storage: storage, fileFilter: incidentAttachmentValidator }).any()
  );
};

module.exports = {
  uploadFiles,
};
