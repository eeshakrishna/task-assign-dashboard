const multer = require('multer');
const path = require('path');

const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  const fileTypes = /csv|xlsx|xls/;
  const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
  if (extname) return cb(null, true);
  cb(new Error('Only CSV, XLSX and XLS files are allowed!'));
};

module.exports = multer({ storage, fileFilter });
