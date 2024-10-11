const multer = require('multer');
const path = require('path');

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: './proofs/',
  filename: function(req, file, cb) {
    cb(null, file.originalname);
  }
});

// Create the multer instance
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 100*1024*1024 }
}).single("file")

module.exports = upload;