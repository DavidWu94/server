const multer = require('multer');
const path = require('path');

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: './proofs/',
  filename: function(req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// Create the multer instance
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10000000 }
}).single('file') // 10MB file size limit});

module.exports = upload;