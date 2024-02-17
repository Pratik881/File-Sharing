const router=require('express').Router()
const multer=require('multer')
const path=require('path')
const File=require('../models/fileMode')
const {v4:uuidv4}=require('uuid')

let storage=multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'uploads/')
    },
    filename:(req,file,cb)=>{
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
              cb(null, uniqueName)
    }

})
let upload=multer({storage,limits:{fileSize:1000000*10},}).single('myfile')
router.post('/',upload,async (req,res)=>{
    const file=new File({
        filename:req.file.filename,
        uuid:uuidv4(),
        path:req.file.path,
        size:req.file.size
    })
    await file.save()
    filelink=`${process.env.APP_BASE_URL}/files/${file.uuid}`
    res.render('sendemail',{
        link:filelink,
        uuid:file.uuid
    })
})
router.post('/send', async (req, res) => {
    const { uuid, emailTo, emailFrom} = req.body;
    if(!uuid || !emailTo || !emailFrom) {
        return res.status(422).send({ error: 'All fields are required except expiry.'});
    }
   //get data from db
   try{
     const file=await File.findOne({uuid})
     if(file.sender){
          return res.status(422).send({error:"email already sent once"})
     }
     file.sender=emailFrom;
     file.receiver=emailTo
      await file.save()
      // send mail
      const sendMail = require('../services/emailService');
      sendMail({
        from: emailFrom,
        to: emailTo,
        subject: 'inShare file sharing',
        text: `${emailFrom} shared a file with you.`,
        html: require('../services/emailTemplate')({
                  emailFrom, 
                  downloadLink: `${process.env.APP_BASE_URL}/files/${file.uuid}?source=email` ,
                  size: parseInt(file.size/1000) + ' KB',
                  expires: '24 hours'
              })
      }).then(() => {
        res.send('success')
        
        
        

      }).catch(err => {
        return res.status(500).json({error: 'Error in email sending.'});
      });
  } catch(err) {
    return res.status(500).send(err.stack);
  }
  
  });
  module.exports=router