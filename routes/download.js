const router= require('express').Router()
const File=require('../models/fileMode')
router.get('/:uuid',async(req,res)=>{
   try {
     const file = await File.findOne({ uuid : req.params.uuid})
     if(!file){
         return res.render('download',{error:'link has been expired'})
     }
  const filePath=`${__dirname}/../${file.path}`
  //console.log(filePath)
 res.download(filePath)
   } catch (error) {
    console.log(error.message)
   }
})
module.exports=router;