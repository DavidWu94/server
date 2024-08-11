const upload = require('../plugins/multer');

module.exports = (sqlPlugin,log,mailer,req,res)=>{
    // Handle the uploaded file
    upload(req,res,(err)=>{
      if (err) {
        console.error(err);
        return res.status(500).json({ error: err });
       }
      if (!req.file) {
         return res.status(400).json({ error: 'Please send file' });
       }
       
       res.send('File uploaded!');
    })
}