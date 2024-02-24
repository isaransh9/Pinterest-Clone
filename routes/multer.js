const multer = require('multer');
const { v4: uuidv4 } = require('uuid');    // this gives unique ids to the files that you upload
const path = require('path');              // default package with node, detects the type of file received

const storage = multer.diskStorage({
  destination: function (req, res, cb) {
    cb(null, './public/images/upload');
  },
  filename: function (req, file, cb) {
    const uniquename = uuidv4();
    cb(null, uniquename + path.extname(file.originalname));
  }
})

const upload = multer({ storage: storage });

module.exports = upload;