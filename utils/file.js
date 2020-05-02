const multer = require("multer");

const MIME_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg"
};

const storage = multer.diskStorage({
  // destination: (req, file, cb) => {
  //   const isValid = MIME_TYPE_MAP[file.mimetype];

  //   let error = null;

  //   if (!isValid) {
  //     error = new Error("Invalid MimeType");
  //   }

  //   cb(error, "public/images");
  // },
  filename: (req, file, cb) => {
    const isValid = MIME_TYPE_MAP[file.mimetype];
    const error = isValid ? null : new Error('Invalid MimeType');

    const name = file.originalname
      .toLowerCase()
      .split(".")[0]
      .split(" ")[0];
    const ext = MIME_TYPE_MAP[file.mimetype];
    cb(error, name + "-" + Date.now() + "." + ext);
  }
});

module.exports =  multer({ storage: storage }).single("image");
